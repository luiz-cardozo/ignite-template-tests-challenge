import { CreateStatementError } from "./CreateStatementError";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("Should be able to create a deposit statement", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "Test",
      email: "test@test.com",
      password: "test",
    });

    const statement = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      description: "deposit description",
      amount: 100,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toEqual(100);
  });

  it("Shouldn't be able to create a statement to a non-existent user", async () => {
    expect(async () => {
      const statement = await createStatementUseCase.execute({
        user_id: "test",
        type: OperationType.DEPOSIT,
        description: "deposit description",
        amount: 100,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be able to create a withdraw statement", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "Test",
      email: "test@test.com",
      password: "test",
    });

    await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      description: "deposit description",
      amount: 100,
    });

    const statement = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.WITHDRAW,
      description: "withdraw description",
      amount: 10,
    });

    const userBalance = await statementsRepositoryInMemory.getUserBalance({
      user_id: String(user.id),
    });

    expect(statement).toHaveProperty("id");
    expect(userBalance.balance).toEqual(90);
  });

  it("Shouldn't be able to create a statement withdraw greater than the balance", async () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: "Test",
        email: "test@test.com",
        password: "test",
      });

      await createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.WITHDRAW,
        description: "withdraw test",
        amount: 10,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
