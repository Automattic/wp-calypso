# Environment Variables

Environment Variables are values that are defined at the system level to serve as configuration for programs.

## Standalone Environment Variables

| Name          | Description                                                                                                                                      | Example | Required | Store in file? |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------- | -------------- |
| MAGELLANDEBUG | If this is set, the full mocha output is printed while running Magellan                                                                          | 1       | No       | **NO**         |
| SAUCEDEBUG    | If this is set, on test failure a breakpoint will be set in SauceLabs, enabling you to continue interacting with the browser for troubleshooting | 1       | No       | **NO**         |

## CircleCI Environment Variables

These environment variables are intended for use inside CircleCI, to control which tests are being run

| Name              | Description                                                                                                                                                   | Default       | Required |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| DISABLE_EMAIL     | Setting this to `true` will cause the Invite and Signup tests to be skipped                                                                                   | false         | No       |
| SKIP_TEST_REGEX   | The value of this variable will be used in the `-i -g *****` parameter, to skip any tests that match the given RegEx. List multiple keywords separated by a ` | `(i.e.`Invite | Domain   | Theme`) | `Empty String` | No |
| SKIP_DOMAIN_TESTS | If this value is set to `true`, the tests that attempt domain registration with be skipped.                                                                   | false         | No       |
| SKIP_JETPACK      | If this value is set to `true`, the Jetpack tests with be skipped. Useful to disable scheduled tests without modifying circleCI config                        | false         | No       |
