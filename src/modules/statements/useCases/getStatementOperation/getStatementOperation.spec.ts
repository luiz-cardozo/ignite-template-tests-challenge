import { GetStatementOperationError } from "./GetStatementOperationError";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });
  it("Should be able to get a statement operation by id", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "test",
      email: "test@test.com",
      password: "test",
    });

    const statement = await statementsRepositoryInMemory.create({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      description: "test deposit",
      amount: 201,
    });

    const response = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(statement.id),
    });

    expect(response.amount).toBe(201);
    expect(response.description).toBe("test deposit");
  });

  it("Shouldn't be able to get statement operation of a non-existent user", async () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: "test",
        email: "test@test.com",
        password: "test",
      });

      const statement = await statementsRepositoryInMemory.create({
        user_id: String(user.id),
        type: OperationType.DEPOSIT,
        description: "test deposit",
        amount: 201,
      });

      const response = await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: String(statement.id),
      });

      await getStatementOperationUseCase.execute({
        user_id: "404",
        statement_id: String(statement.id),
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Shouldn't be able to get statement operation of a non-existent statement", async () => {
    expect(async () => {
      const userDTO = {
        name: "João das Coves",
        email: "joaodascoves@email.com",
        password: "123senha",
      };
      const user = await usersRepositoryInMemory.create(userDTO);

      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: "404",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
