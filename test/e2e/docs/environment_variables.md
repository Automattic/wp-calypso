Return to [Top Page](../README.md).

# Environment Variables

Environment Variables are values that are defined at the system level to serve as configuration for programs.

## Required

| Name            | Description                                         |
| --------------- | --------------------------------------------------- |
| CONFIG_KEY      | Secrets decryption key obtained from a8c key store. |
| NODE_CONFIG_ENV | Name of decrypted secrets file.                     |

## Framework

| Name                  | Description                                         | Default                                                          |
| --------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| HEADLESS              | Configure browser headless/headful mode.            | false                                                            |
| SLOW_MO               | Slow down the execution by given milliseconds.      | 0                                                                |
| AUTHENTICATE_ACCOUNTS | List of accounts to pre-authenticate for later use. | [ 'simpleSitePersonalPlanUser', 'eCommerceUser', 'defaultUser' ] |
| COOKIES_PATH          | Path on disk to the saved authenticated cookies.    | ./cookies/                                                       |
| VIEWPORT_NAME         | Specify the viewport to be used.                    | desktop                                                          |

## CI

| Name           | Description                            | Example | Required |
| -------------- | -------------------------------------- | ------- | -------- |
| COBLOCKS_EDGE  | Use the bleeding edge CoBlocks build.  | true    | No       |
| GUTENBERG_EDGE | Use the bleeding edge Gutenberg build. | true    | No       |

<!-- When adding new rows, run the following command to sort the resulting sub-table in alphabetical order:

cd test/e2e/docs
head -n 38 environment_variables.md | tail +33 | sort --field-separator=\| --key=1

Adjust the value of `head -n <x>` to be the last row of the table to be sorted.
Adjust the value of `tail +x` to be the first row of the table to be sorted.

eg. head -n 28 environment_variables.md | tail +27 | sort --field-separator=\| --key=1

-> sorts from row 27 to 28.
 -->
