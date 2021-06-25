# Debugging

## Table of contents

<!-- TOC -->

- [Debugging](#debugging)
  - [Table of contents](#table-of-contents)
  - [Visual Studio Code](#visual-studio-code)
  - [Enable Mocha Debug Output](#enable-mocha-debug-output)

<!-- /TOC -->

## Visual Studio Code

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

## Enable Mocha Debug Output

To set verbose output for `mocha`, prepend the command as follows:

```
DEBUG=mocha:* <command>
```

eg.

```
DEBUG=mocha:* node_modules/.bin/mocha specs/wp-manage-domains-spec.js
```
