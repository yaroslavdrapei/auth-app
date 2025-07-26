# How to start the project
```bash
docker compose --env-file .env.development up 
```

# How to run tests
```bash
npm run test -- for unit tests
npm run test:e2e -- for e2e tests (starts separate docker compose)
```

# Answers to the questions in the file with task

### 2. What if
First of all, makes of use of caching. In my case i added cache for the verify function so works faster due to caching the payload. It has its drawbacks, like when we might try to make token revocation system we would probably need to delete the cache for verify as well. Also I we are hitting 100000 requests per second i will assume that we are using kubernetes, then i would make sure that this has autoscaling so there are more instances of this service working with this high load

### 3. Social login
For this task, I would use oauth2 technology. In nest there are packages for it like passport and @nestjs/passport, and more depending on who do we want to integrate (google, facebook, github, etc). Lets take google as example. So what would i do:
1. Implement stragety for passport for google
2. Register the app in google dev console to get client id and secret. Or if it's team, just reuse those
3. Make endpoint auth/google which would redirect to login with google
4. Make endpoint like auth/google/callback that google would comeback to in case of successful login and give us the user info we asked for, like email and full name for example
5. Create a jwt token for user with the information retrieved from google and return it to them
