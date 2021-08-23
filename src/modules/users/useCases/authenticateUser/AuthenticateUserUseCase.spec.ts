import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "test",
      email: "test@test.com",
      password: "1234",
    };

    await createUserUseCase.execute(user);

    const response = await authenticateUserCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(response).toHaveProperty("token");
    expect(response.user).toHaveProperty("id");
  });

  it("should not be able to authenticate an user with an incorrect email", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "test",
        email: "test@test.com",
        password: "1234",
      };

      await createUserUseCase.execute(user);

      await authenticateUserCase.execute({
        email: "email test",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate an user with an incorrect password", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "test",
        email: "test@test.com",
        password: "1234",
      };

      await createUserUseCase.execute(user);

      await authenticateUserCase.execute({
        email: user.email,
        password: "password test",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
