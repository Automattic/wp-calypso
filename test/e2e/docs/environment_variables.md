# Environment Variables

Environment Variables are values that are defined at the system level to serve as configuration for programs.

## Required

| Name            | Description                                         | Example   | Required | Store in file? |
| --------------- | --------------------------------------------------- | --------- | -------- | -------------- |
| CONFIG_KEY      | Secrets decryption key obtained from a8c key store. | hunter2   | No       | **NO**         |
| NODE_CONFIG_ENV | Name of decrypted secrets file.                     | decrypted | No       | **NO**         |

## Magellan

| Name          | Description                                                              | Example | Required | Store in file? |
| ------------- | ------------------------------------------------------------------------ | ------- | -------- | -------------- |
| MAGELLANDEBUG | If this is set, the full mocha output is printed while running Magellan. | 1       | No       | **NO**         |

## Test Framework (Selenium)

| Name            | Description                                              | Example          | Required | Store in file? |
| --------------- | -------------------------------------------------------- | ---------------- | -------- | -------------- |
| BROWSERLOCALE   | Specify the target browser locale.                       | en               | No       | **NO**         |
| BROWSERSIZE     | Specify the target browser window size.                  | desktop          | No       | **NO**         |
| HEADLESS        | Configure browser headless/headful mode.                 | 1                | No       | **NO**         |
| SCREENSHOTDIR   | Override the default path for screenshots to be written. | /tmp/screenshots | No       | **NO**         |
| TEMP_ASSET_PATH | Override the base artifacts path.                        | /tmp/artifacts   | No       | **NO**         |
| TEST_VIDEO      | Configure if video recording is to be used.              | true             | No       | **NO**         |

## Test Framework (Playwright)

| Name            | Description                                                   | Example          | Required | Store in file? |
| --------------- | ------------------------------------------------------------- | ---------------- | -------- | -------------- |
| DISPLAYSIZE     | Specify the target browser window size.                       | desktop          | No       | **NO**         |
| HEADLESS        | Configure browser headless/headful mode.                      | 1                | No       | **NO**         |
| LOCALE          | Specify the target browser locale.                            | en               | No       | **NO**         |
| SCREENSHOTDIR   | Override the default path for screenshots to be written.      | /tmp/screenshots | No       | **NO**         |
| TEMP_ASSET_PATH | Override the base artifacts path.                             | /tmp/artifacts   | No       | **NO**         |
| VIDEODIR        | Override the default path for video recordings to be written. | /tmp/recordings  | No       | **NO**         |

<!-- When adding new rows, run the following command to sort the resulting sub-table in alphabetical order:

cd test/e2e/docs
head -n 38 environment_variables.md | tail +33 | sort --field-separator=\| --key=1

Adjust the value of `head -n <x>` to be the last row of the table to be sorted.
Adjust the value of `tail +x` to be the first row of the table to be sorted.
 -->
