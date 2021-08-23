import { OperationType } from "../../entities/Statement";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should return the operations and balance of an user", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "test",
      email: "test@test.com",
      password: "test",
    });

    const statements = [
      inMemoryStatementsRepository.create({
        user_id: String(user.id),
        amount: 1000,
        description: "deposit operation",
        type: OperationType.DEPOSIT,
      }),

      inMemoryStatementsRepository.create({
        user_id: String(user.id),
        amount: 100,
        description: "withdraw operation",
        type: OperationType.WITHDRAW,
      }),
    ];

    const getBalance = await getBalanceUseCase.execute({
      user_id: String(user.id),
    });

    await Promise.all(statements);

    expect(getBalance).toHaveProperty("balance");
    expect(getBalance.balance).toBe(900);
    expect(getBalance.statement).toHaveLength(2);
  });

  it("should not return the balance of a non-existent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "123" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
