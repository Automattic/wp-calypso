# Environment Variables

Environment Variables are values that are defined at the system level to serve as configuration for programs.

## Required

| Name            | Description                                         | Example   | Required | Can store in config file? |
| --------------- | --------------------------------------------------- | --------- | -------- | ------------------------- |
| CONFIG_KEY      | Secrets decryption key obtained from a8c key store. | hunter2   | No       | **NO**                    |
| NODE_CONFIG_ENV | Name of decrypted secrets file.                     | decrypted | No       | **NO**                    |

## Framework

| Name              | Description                                          | Example  | Required | Can store in config file? |
| ----------------- | ---------------------------------------------------- | -------- | -------- | ------------------------- |
| COOKIES_PATH      | Path on disk to the saved authenticated cookies.     | cookies/ | No       | **NO**                    |
| COOKIES_PATH      | Path on disk to the saved authenticated cookies.     | cookies/ | No       | **NO**                    |
| HEADLESS          | Configure browser headless/headful mode.             | true     | No       | YES                       |
| LOCALE            | Specify the target browser locale.                   | en       | No       | YES                       |
| SAVE_AUTH_COOKIES | Whether to save authenticated cookies for later use. | true     | No       | YES                       |
| TARGET_DEVICE     | Specify the device type to be used.                  | desktop  | No       | YES                       |

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
