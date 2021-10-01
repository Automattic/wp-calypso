# Debugging

## Table of contents

<!-- TOC -->

- [Debugging](#debugging)
  - [Table of contents](#table-of-contents)
  - [Selenium/mocha](#seleniummocha)
    - [Visual Studio Code](#visual-studio-code)
    - [Enable Mocha Debug Output](#enable-mocha-debug-output)
  - [Playwright/Jest](#playwrightjest)
    - [Debug instance](#debug-instance)
    - [Playwright Developer Console and Gutenberg iFrame](#playwright-developer-console-and-gutenberg-iframe)
    - [Additional notes](#additional-notes)

<!-- /TOC -->

## Selenium/mocha

### Visual Studio Code

For users of Visual Studio Code (VSCode), it is possible to attach to `mocha` while it is executing and step through the e2e tests.

1. From VSCode, create `launch.json`.
2. Paste in the following:

```
{
    "type": "node",
    "request": "attach",
    "name": "Mocha: tests",
    "processId": "${command:PickProcess}",
    "restart": true,
    "protocol": "inspector",
}
```

3. When ready to run a test, run the `mocha` debug server as follows:

```
node_modules/.bin/mocha --inspect-brk specs/<spec_file>
```

4. From VSCode > Debug, hit F5 or the Play button.
5. The command pallette should show a list of `node` processes that can be attached to.
6. Select the debug server started in Step 3.

Entrypoint for the debugger is `mocha/cli.js`.

Set breakpoints in your test cases and flows, page objects and components to step through the execution.

### Enable Mocha Debug Output

To set verbose output for `mocha`, prepend the command as follows:

```
DEBUG=mocha:* <command>
```

eg.

```
DEBUG=mocha:* node_modules/.bin/mocha specs/wp-manage-domains-spec.js
```

## Playwright/Jest

### Debug instance

While developing tests and/or debugging flakey e2e tests, it is often helpful to have a browser window open with Playwright hooked in.

Launch Playwright with the following parameters to:

- extend Jest timeout to a long value
- disable Playwright's internal timeout (30s)
- output verbose logs to the command line

```bash
export PWDEBUG=1 DEBUG=pw:api yarn jest --runInBand --setTimeout=10000000000<spec>
```

### Playwright Developer Console and Gutenberg iFrame

As noted in [official documentation](https://playwright.dev/docs/debug#selectors-in-developer-tools-console), when Playwright is launched with `PWDEBUG` a Playwright object is available in the browser's developer console. This is a powerful tool to help debug selectors.

However the Playwright object does not have visibility into elements on iFramed Gutenberg editor pages (eg. New Post) by default.

To be able to select elements of the iFramed editor:

1. launch developer tools (F12)

2. click on Console tab.

3. immediately below the top bar, click on the dropdown with text `top`

4. select option `post-new.php`

5. try selecting an element on page.

### Additional notes

Jest documentation on setting up VSCode debugger can be found [here](https://jestjs.io/docs/troubleshooting#debugging-in-vs-code).

If using VSCode, setting up the debugger using the attaching method is often easier (as opposed to directly launching Jest in the `launch.json`). The attach configuration gives you more control over which script you want to run.

The E2E tests use the Jest binary that is installed at the root level of the repo. Put all together, if you were currently in the `e2e` directory, the command to run a single spec would look like `node --inspect-brk ../../node_modules/.bin/jest --runInBand specs/specs-playwright/wp-auth__canary-spec.ts`
