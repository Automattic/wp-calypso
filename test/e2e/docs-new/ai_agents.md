# AI Agents

## Background

Playwright Test, since v1.56, provides three AI agents to use in VSCode to assist with planning, generating and fixing Playwright tests.

```
Playwright comes with three Playwright Test Agents out of the box: 🎭 planner, 🎭 generator and 🎭 healer.

These agents can be used independently, sequentially, or as the chained calls in the agentic loop. Using them sequentially will produce test coverage for your product.

🎭 planner explores the app and produces a Markdown test plan
🎭 generator transforms the Markdown plan into the Playwright Test files
🎭 healer executes the test suite and automatically repairs failing tests
```

[Reference](https://playwright.dev/docs/test-agents)

These were initially installed by running `npx playwright init-agents --loop=vscode` which generated three VSCode "chatmode" files.

_Note:_ these agents require VSCode of at least 1.105 which is available on the general releases of VSCode so make sure you've updated.

## Updating agents

The three chatmode files are:

1. `.github/chatmodes/🎭 planner.chatmode.md`
2. `.github/chatmodes/🎭 generator.chatmode.md`
3. `.github/chatmodes/🎭 healer.chatmode.md`

These can be manually updated to give custom or more detailed instructions for these agents, for example, the generator chatmode file has been slightly modified to use `test.step` blocks.

_Note:_ when modifying these files you need to launch a new chat window to get the changes made to take effect as VSCode seems to cache the instructions for each chat window.

_Also,_ if there is a major Playwright update the above command (`npx playwright init-agents --loop=vscode`) should be run again to regenerate the agents, but any customisations will need to be reapplied, so look at the git diffs carefully.

## Using agents to convert existing specs to Playwright Test

> convert the plans-signup-business spec into playwright test spec with the name `plans-signup-business.spec.ts` using as many fixtures as possible.

## Tips & Tricks

Make sure any existing changes are committed before you run any agent command so you can see a clear git diff showing every file that has been updated and decide whether or not it's a good change!
