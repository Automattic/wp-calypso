<div style="width: 45%; float:left" align="left"><a href="./style_guide.md"><-- Style Guide</a> </div>
<div style="width: 5%; float:left" align="center"><a href="./../README.md">Top</a></div>
<div style="width: 45%; float:right"align="right"><a href="./troubleshooting.md"> Troubleshooting --></a> </div>

<br><br>

# Debugging

<!-- TOC -->

- [Debugging](#debugging)
    - [Playwright native tools](#playwright-native-tools)
    - [Debug instance](#debug-instance)
    - [Playwright Developer Console and Gutenberg iFrame](#playwright-developer-console-and-gutenberg-iframe)
    - [VSCode Debugger and Jest](#vscode-debugger-and-jest)

<!-- /TOC -->

## Playwright native tools

The Playwright [project page](https://playwright.dev/docs/debug/) has in-depth coverage of various debugging tools.

Of those tools, there are two that are worth calling out as particularly useful:
- [The Playwright Inspector](https://playwright.dev/docs/inspector) - A very easy way to quickly see what's going wrong with a spec you are writing.
- [The Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer#viewing-the-trace) - Any failing test will write a trace to a `.zip` file. These traces are included when running locally, and they are also included as test artifacts in TeamCity builds.

The rest of this page will cover debugging scenarios unique to WordPress.com and Calypso.


## Debug instance

<img src="https://cldup.com/FURE4BK9FF.png">

While developing tests and/or debugging flakey e2e tests, it is often helpful to have a browser window open with Playwright hooked in order to verify selector behavior.

Launch Playwright with the following parameters to:

- disable Playwright's internal timeout (30s)
- output verbose logs to the command line

```bash
PWDEBUG=1 DEBUG=pw:api yarn jest <path_to_spec>
```

## Playwright Developer Console and Gutenberg iFrame

As noted in [official documentation](https://playwright.dev/docs/debug#selectors-in-developer-tools-console), when Playwright is launched with `PWDEBUG` a Playwright object is available in the browser's developer console. This is a powerful tool to help debug selectors.

However the Playwright object does not have visibility into elements on iFramed Gutenberg editor pages (eg. New Post) by default.

To be able to interact with elements of the iFramed editor:

1. launch developer tools (F12)

2. click on Console tab.

3. immediately below the top bar, click on the dropdown with text `top`

4. select option `post-new.php`

5. try selecting an element on page.

<img src="https://cldup.com/cSQEdamVDI.gif"/>

## VSCode Debugger and Jest

Jest documentation on setting up VSCode debugger can be found [here](https://jestjs.io/docs/troubleshooting#debugging-in-vs-code).

If using VSCode, setting up the debugger using the attaching method is often easier (as opposed to directly launching Jest in the `launch.json`). The attach configuration gives you more control over which script you want to run.

The E2E tests use the Jest binary that is installed at the root level of the repo. Put all together, if you were currently in the `e2e` directory, the command to run a single spec would look like `node --inspect-brk ../../node_modules/.bin/jest --runInBand specs/specs-playwright/wp-auth__canary-spec.ts`
