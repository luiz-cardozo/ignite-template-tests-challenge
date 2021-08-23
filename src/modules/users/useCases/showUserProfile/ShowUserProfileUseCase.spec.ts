import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should show an user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "test",
    });

    const response = await showUserProfileUseCase.execute(String(user.id));

    expect(response).toEqual(user);
  });

  it("should not find an user with unexistent id", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
