Return to [Top Page](../README.md).

# Environment Variables

Environment Variables control much of the runtime configuration for E2E tests.

## Current Environment Variables

| Name                  | Description                                                         | Default                                              |
| --------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| ARTIFACTS_PATH        | Path on disk to test artifacts (screenshots, logs, etc).            | ./results/                                           |
| AUTHENTICATE_ACCOUNTS | Comma-delimited list of accounts to pre-authenticate for later use. | simpleSitePersonalPlanUser,atomicUser,defaultUser    |
| CALYPSO_BASE_URL      | The base URL to use for Calypso                                     | <https://wordpress.com>                              |
| COBLOCKS_EDGE         | Use the bleeding edge CoBlocks build.                               | false                                                |
| COOKIES_PATH          | Path on disk to the saved authenticated cookies.                    | ./cookies/                                           |
| GUTENBERG_EDGE        | Use the bleeding edge Gutenberg build.                              | false                                                |
| HEADLESS              | Configure browser headless/headful mode.                            | false                                                |
| SLOW_MO               | Slow down the execution by given milliseconds.                      | 0                                                    |
| TEST_LOCALES          | The locales to target for I18N testing                              | A long list of currently supported locales.          |
| TEST_ON_ATOMIC        | Use a user with an Atomic site.                                     | false                                                |
| TEST_ON_JETPACK       | Use a user with a jetpack connected site.                           | false                                                |
| VIEWPORT_NAME         | Specify the viewport to be used.                                    | desktop                                              |

<!-- When adding new rows, run the following command to sort the resulting sub-table in alphabetical order:

cd test/e2e/docs
head -n 38 environment_variables.md | tail +33 | sort --field-separator=\| --key=1

Adjust the value of `head -n <x>` to be the last row of the table to be sorted.
Adjust the value of `tail +x` to be the first row of the table to be sorted.

eg. head -n 28 environment_variables.md | tail +27 | sort --field-separator=\| --key=1

-> sorts from row 27 to 28.
 -->
