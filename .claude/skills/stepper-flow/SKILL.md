# /stepper-flow

Build a new Stepper signup flow from a plain-English description.

Produces PR-ready files: the flow TypeScript, README, style.scss, the flow constant,
and the registration entry. No new steps are created — only existing steps are composed.

Also supports step customization (changing behavior via props or store settings) and
surfaces honest guardrails when a desired change requires an Engineering PR.

---

## Instructions

Follow the phases below in order. Never skip a phase.

---

### Phase 1 — Load context

Read these files silently before saying anything to the user:

- `client/landing/stepper/AGENTS.md` — framework rules, step table, customization catalog, pitfalls
- `client/landing/stepper/declarative-flow/internals/steps.tsx` — authoritative list of available steps
- `client/landing/stepper/declarative-flow/registered-flows.ts` — existing flow names (avoid collisions)
- `packages/onboarding/src/utils/flows.ts` — existing flow constants (avoid collisions)
- `client/landing/stepper/declarative-flow/flows/00-example-flow/example.ts` — canonical reference flow

---

### Phase 2 — Interview the user

Send all questions in a **single message**. Do not proceed until you have answers to all of them.

Write the questions in plain English — explain what each one means for someone unfamiliar with Stepper.
Never use unexplained TypeScript terms (no "kebab-case", "slug", "constant") unless you define them inline.

```
Hi! Let's build your flow together. I'll ask a few questions, then show you a preview before writing anything.

1. FLOW NAME
   A short, unique identifier for this flow — lowercase letters and hyphens only.
   Example: "hosting-pro" or "newsletter-launch".
   This becomes the URL: /setup/<your-name>.

2. WHAT IS THIS FLOW FOR?
   One sentence describing what it does and who it's for.
   Example: "A signup flow for users who want to launch a newsletter."

3. USER JOURNEY
   Walk me through the steps in plain English, in order.
   Example: "User picks a goal → searches for a domain → picks a plan →
   site is created → sees a launchpad with next steps."

   Available step categories (type "show me [category]" to see the full list with descriptions):
     • Onboarding (goal selection, intent, surveys)
     • Domain (domain search, connect existing domain)
     • Plans & payment
     • Site setup (site name/tagline, design picker, theme chooser)
     • Newsletter-specific
     • Post-signup (launchpad, celebration, subscribers)
     • Site picker / utility
     • Import / migration

4. LOGIN REQUIREMENT
   Should users be required to log in (or create an account) before they can proceed?
   Default: yes — all steps require login. Say "no" only if you want users to browse
   some steps before creating an account.

5. ACCESS GATE
   Should this flow be restricted to certain users (e.g. agency accounts, feature-flagged users)?
   If yes, describe the condition. Otherwise say "no".

6. STEP CUSTOMIZATIONS
   Do you want to change anything about how specific steps look or behave?
   Examples:
     • "Show only yearly and 2-year billing options on the plans step"
     • "Hide the free plan option"
     • "Change the intent to Newsletter so step labels reflect that"
   Note: some customizations are instant; others require an Engineering PR. I'll tell you which.

7. OWNER
   Who owns this flow? A team name or GitHub handle — goes in the README.
   Example: "@growthteam"

8. CONTEXT LINK (optional)
   A Linear issue or P2 post link for background context. Goes in the README.
```

If the user types **"show me [category]"** for any step category, print the relevant rows
from the step table in AGENTS.md in plain English before continuing:

```
Here are the [category] steps:

• Goals — asks the user what they want to create (blog, store, portfolio, newsletter…)
• Intent — a simpler, alternative version of the Goals step
• Segmentation survey — a short survey to understand what kind of user this is
…
```

---

### Phase 3 — Map the journey to steps

Using the step table in AGENTS.md:

- Map each plain-English step to one or more `STEPS.*` constants from `steps.tsx`.
- Verify every chosen step exists in `steps.tsx` before including it.
- Always include `STEPS.ERROR` whenever `STEPS.PROCESSING` is in the flow.
- The `case` value in `useStepNavigation` must match the step's `slug` field in `steps.tsx`, not the `STEPS.*` key name.
- If the user's description requires a step that does not exist, name the closest available step and ask if it's acceptable. Never invent slugs.

#### 3a. Inspect each chosen step's source (don't trust the catalog alone)

The step table in `AGENTS.md` is a short hand-written summary. Some steps look generic in
the table but are hardcoded to a specific use case in their component file (e.g.
`SEGMENTATION_SURVEY` looks generic but uses `ENTREPRENEUR_TRIAL_SURVEY_KEY` and only
asks store/commerce-related questions). The user picks from plain-English descriptions
and will not catch this. The skill must.

Before showing the Phase 3 preview, for **each** `STEPS.*` chosen, open
`client/landing/stepper/declarative-flow/internals/steps-repository/<dir>/index.tsx`
(the directory matches the step's `asyncComponent` import path in `steps.tsx`) and
extract:

1. **Top-level heading text** — the string passed to `FormattedHeader` `headerText`,
   `StepContainer` `formattedHeader`, or any `<h1>`/`heading` in the JSX. This is
   what the user will visually see at the top of the step.
2. **Hardcoded survey/key constants** — module-level `const SOMETHING_KEY = '...'`
   declarations, especially anything ending in `_KEY`, `_SURVEY`, `_INTENT`, or
   `_THEME`. These often pin the step to a narrow use case.
3. **Hardcoded `Onboard.SiteIntent.*` references** — if the component itself sets
   intent (vs the flow setting it), surface it.
4. **Hardcoded themes** — references like `'pub/lettre'`, `'pub/blockbase'`.
5. **Mode/variant constants** — anything like `mode='ecommerce'`, `variant='blog'`
   passed to the underlying component.

For each step, if any of the above pin the step to a specific use case that doesn't
match what the user described in Phase 2, **flag it in the preview** before the user
confirms. The warning is shown directly to the user and must be plain English — no
references to props, keys, survey constants, "Engineering PR", or any TypeScript-flavoured
terms. Describe what the user will actually see on screen and what the limitation means.

Example wording (use this style — short, concrete, jargon-free):

```
⚠️  Segmentation survey — this step looks generic, but it only asks
    questions about selling products or migrating a store. The user
    will see headings like "What would you like to do?" and "What are
    you planning to sell?". If you wanted a more general survey, this
    step won't fit — we'd need an engineer to make it flexible first.
    Want to keep it as-is, swap it for something else, or skip the
    survey?
```

Do **not** silently swap the step. The user picked it; flag the mismatch and let
them confirm or change.

Then present a plain-English preview to the user — no TypeScript, no slug names, just the flow:

```
Here's the flow I'll build:

  1. Goals — user picks what they want to create
  2. Domain search — user searches for and picks a domain
  3. Plans — user picks a plan (yearly and 2-year billing only)
  4. Site creation — runs in the background while a progress bar shows
  5. Launchpad — user sees a checklist of next steps
  (Error screen is included automatically in case site creation fails)

CUSTOMIZATIONS I'll apply:
  ✅ Plans step: show only yearly and 2-year billing options (supported, no Engineering needed)
  ✅ Intent set to Newsletter in initialize() (store-based, supported)

CUSTOMIZATIONS that need Engineering first:
  ⚠️  Goals step: hiding individual goal options is not yet supported.
      To request this, ask in #dotcom-stepper:
      "Please add an `accepts: { hiddenGoals?: SiteGoal[] }` prop to the Goals step
       so flows can suppress specific goal options."

Does this look right? Reply "yes" to generate the files, or tell me what to change.
```

Do not write any files until the user confirms.

---

### Phase 4 — Write the files

Write all files in one pass. Do not ask for permission for each one — write them all, then summarise.

#### 4a. Flow constant

File: `packages/onboarding/src/utils/flows.ts`

Append (do not replace existing entries):

```ts
export const <SCREAMING_SNAKE_FLOW_NAME> = '<kebab-flow-name>';
```

#### 4b. Flow implementation

File: `client/landing/stepper/declarative-flow/flows/<flow-name>/<flow-name>.ts`

Use the FlowV2 pattern from AGENTS.md exactly. Rules:

- Import the constant from `@automattic/onboarding`.
- `initialize` must be a plain function (not an arrow function) so TypeScript infers `typeof initialize` correctly.
- Always use `stepsWithRequiredLogin()` unless the user explicitly asked for pre-auth steps.
- Set `__experimentalUseSessions: true` whenever `useFlowState` is used.
- Every step slug in the `switch` must be a `case` — do not use `default` as a catch-all for navigation.
- The `submit` handler must return or break on every case — no fall-through.
- For `STEPS.PROCESSING` submissions: check `providedDependencies?.processingResult === ProcessingResult.SUCCESS`. On success, redirect with `window.location.replace()`. On failure, `navigate('error')`.
- Use `window.location.replace()` (not `.href`) to avoid a back-button loop after checkout or /home redirects.

**If the flow uses `setPendingAction( () => createSite(...) )`** (any flow that creates a site via `STEPS.PROCESSING`):

- Set `__experimentalUseSessions: true` on the flow object.
- Import `useFlowState` and call `set( 'plans', providedDependencies )` in the `case 'plans'` branch of `submit` **before** calling `setPendingAction`.
- This is non-optional: `useCreateSite()` reads `planCartItems` from `useFlowState().get('plans')` internally. Without these two changes, the site is created with no plan in the cart, and the processing step's `goToCheckout` will be `false` — silently breaking the checkout redirect.

**If store-based customizations were requested** (e.g. intent, hide comparison table):
Add the appropriate `dispatch( ONBOARD_STORE )` calls inside `initialize()` — see the
"Store-based customizations" section of AGENTS.md for the full list.

**If `useStepsProps` customizations were requested** (e.g. `displayedIntervals`, `isInSignup`):
Add a `useStepsProps()` method to the flow object — see AGENTS.md for the pattern and
the full list of props `STEPS.UNIFIED_PLANS` accepts.

Only include `useStepsProps` if at least one step has supported props to pass.
Do not add it for customizations that require Engineering — those go in the preview
callout only (Phase 3), not in the generated code.

#### 4c. README

File: `client/landing/stepper/declarative-flow/flows/<flow-name>/README.md`

Use the README template from AGENTS.md. Write 3–5 concrete testing steps covering the
happy path and at least one edge case (e.g. "pick the free plan", "go back from plans").

#### 4d. Style

File: `client/landing/stepper/declarative-flow/flows/<flow-name>/style.scss`

```scss
// Flow-specific styles for <flow-name>.
// Import this file from <flow-name>.ts if you add styles here.
```

#### 4e. Registration

File: `client/landing/stepper/declarative-flow/registered-flows.ts`

Add an import at the top and an entry in the `availableFlows` object:

```ts
import { <CONSTANT> } from '@automattic/onboarding';
// ...
[ <CONSTANT> ]: () => import( /* webpackChunkName: "<flow-name>" */ './flows/<flow-name>/<flow-name>' ),
```

---

### Phase 5 — TypeScript check

Before browser testing, verify the generated code compiles:

```bash
cd /path/to/wp-calypso && yarn typecheck-client 2>&1 | tail -20
```

If `yarn typecheck-client` crashes with a V8 out-of-memory trace (long `InterpreterEntryTrampoline` stack), re-run with a larger heap and filter for actual errors:

```bash
NODE_OPTIONS="--max-old-space-size=8192" yarn typecheck-client 2>&1 | grep -E "(error TS|<flow-name>)" | head -30
```

If there are TypeScript errors in the generated files, fix them before continuing.
Pre-existing errors elsewhere in the codebase (e.g. unrelated `Cannot find module` errors) are not a blocker — only fix errors that point at files you just created.
Do not proceed to Phase 6 if the type check fails on your files.

---

### Phase 6 — Browser test loop

Use the `playwright-test` MCP server (configured in `.mcp.json` at the repo root) to
drive a real browser against the local dev server and validate the flow end-to-end.

#### 6a. Prerequisites

Check the dev server is reachable:

```
GET http://calypso.localhost:3000/setup/<flow-name>
```

If it returns a connection error, tell the user:

> The local dev server doesn't appear to be running. Start it with `yarn start` and
> try again, or skip browser testing and go straight to the PR.

**Note:** An HTTP 200 here only proves the Node server is alive — it does **not** mean
webpack's last build was clean. The Calypso dev server happily serves the HTML shell
and previously-cached JS bundles even when the latest build failed. The real build-
health check happens in 6c after the page renders.

#### 6b. Generate a test email

Construct a throwaway email for signup:

```
test-<8-random-hex-chars>@example.com
```

Example: `test-a3f9c21b@example.com`

Using `@example.com` is safe — the domain is reserved for documentation and
testing (RFC 2606). It will never receive email, so it does not affect spam scores
and no email verification is needed.

#### 6c. Walk through the flow

Use the Playwright MCP tools to navigate, interact, and screenshot each step:

1. Navigate to `http://calypso.localhost:3000/setup/<flow-name>`
2. **Build-health check (do this BEFORE interacting):**
   - Look for a `Build failed` overlay element in the first `browser_snapshot`
     (Calypso renders a small red `BUILD FAILED` badge near the bottom-right when
     webpack's last compile errored).
   - Call `browser_console_messages({ onlyErrors: true })` and scan for
     `[webpack] build finished with N errors` followed by lines starting with
     `ERROR in ./...`.
   - If either signal is present, triage:
     - **Does the failing module path mention `flows/<flow-name>/` or any file you
       just wrote/edited?** If yes, this is **your** error — stop the walkthrough,
       fix it (Phase 5 should have caught it but didn't; fix at the source), and
       restart from step 1.
     - **Otherwise it's a pre-existing repo-state error** (e.g. a missing
       dependency in an unrelated module). The flow can still be tested because
       webpack serves the previously-cached bundle. Continue, but record the
       webpack error verbatim under "Build health" in the test report (6e). Do
       **not** silently ignore it.
3. On the account creation screen, enter the test email and complete signup.
4. Walk through each step of the flow in order, making minimal valid choices
   (pick any goal, search any domain, etc.).
5. Take a screenshot after each step completes successfully.
6. If a step fails (error message, broken layout, infinite spinner, wrong redirect):
   - Take a screenshot of the failure
   - Note the step slug and what went wrong
   - Stop the run and proceed to 6d

**Multiple-pathway flows:** if the flow has more than one terminal branch (e.g.
free plan → in-Stepper celebration vs. paid plan → external `/checkout` redirect,
or `use-my-domain` vs. `domains` fork), you MUST walk **each** branch and
screenshot the divergence point + each step after it. A single happy-path run is
not enough — the branches share early steps but differ at the decision point, and
that difference is the most likely place for regressions. Common forks to cover:

- Free plan vs. paid plan on `STEPS.UNIFIED_PLANS` (when `isInSignup: true` and
  free is not hidden) — paid-plan run only needs to reach the `/checkout/<siteSlug>`
  URL; do not complete a real purchase.
- `use-my-domain` fork on `STEPS.DOMAIN_SEARCH` when `STEPS.USE_MY_DOMAIN` is in
  the flow.
- Any conditional `navigate()` in the flow's `useStepNavigation` that switches on
  a boolean in `providedDependencies`.

Between branch runs, log out (see 6d step 3) and generate a fresh test email so
`stepsWithRequiredLogin` doesn't reuse the previous account.

If all branches complete without errors, proceed directly to 6e.

#### 6d. Fix and retry (iteration loop)

When an issue is detected:

1. Identify the root cause in the flow TypeScript file
   (wrong slug in a `case`, missing `navigate()`, bad `processingResult` check, etc.)
2. Fix the file
3. **Log the previous test user out before retrying** — `stepsWithRequiredLogin` will skip the user step for an already-authenticated session and reuse the prior account, which defeats the "fresh test email" instruction below. Log out by navigating to:
   ```
   https://wordpress.com/wp-login.php?action=logout
   ```
   then click the "log out" confirmation link.
4. Generate a fresh 8-hex test email and re-run from 6c (navigate back to `/setup/<flow-name>`).
5. Repeat until the flow completes without errors or until 3 iterations have been
   attempted — if still failing after 3, document the remaining issue in the report
   and move on.

#### 6e. Write the test report

Write a Markdown report to:

```
client/landing/stepper/declarative-flow/flows/<flow-name>/TEST-REPORT.md
```

Use this structure:

```md
# Browser Test Report — <flow-name>

**Date:** <ISO date>
**Test email:** test-<hex>@example.com
**Base URL:** http://calypso.localhost:3000
**Result:** ✅ Passed / ⚠️ Passed with fixes / ❌ Failed (see issues)

## Build health

State one of:

- **Clean** — no `Build failed` overlay, no webpack errors in console.
- **Pre-existing webpack error (unrelated)** — list the failing module path and the
  missing import verbatim. State explicitly that it does not touch the flow's
  generated files and confirm the cached bundle was sufficient to exercise the flow.
- **Webpack error in the flow's own files** — should not appear in the final report
  because 6c stops the walkthrough and routes to 6d when this is detected.

## Steps walkthrough

For flows with a single linear path, use one table. For flows with multiple
terminal branches, use one table per branch under a `### Branch: <name>` heading
(e.g. `### Branch: free plan`, `### Branch: paid plan`).

| Step          | Slug    | Result | Notes                            |
| ------------- | ------- | ------ | -------------------------------- |
| Goals         | goals   | ✅     | Rendered and submitted correctly |
| Domain search | domains | ✅     | Free domain selected             |
| …             | …       | …      | …                                |

## Screenshots

### Step: <step-name>

![<step-name>](./<step-name>.png)

…

## Issues found and fixed

### Issue 1 — <short title>

**Step:** <slug>
**Symptom:** <what was observed>
**Fix applied:** <what was changed in the flow file>

## Remaining issues (if any)

<List any issues that could not be resolved after 3 iterations, with screenshots>
```

Save each screenshot alongside the report as `<step-slug>.png`.

**Screenshot path constraint:** the `playwright-test` MCP server only writes screenshots inside its own output directory (`.playwright-mcp/` at the repo root). Passing an absolute path outside that directory fails. Workflow:

1. When calling `browser_take_screenshot`, pass a relative filename like `ppc-test-plans.png` (no directory prefix). The file lands in `.playwright-mcp/`.
2. After the walkthrough is done, copy the screenshots into the flow folder so the report's relative links resolve:
   ```bash
   cp .playwright-mcp/<flow-name>-*.png client/landing/stepper/declarative-flow/flows/<flow-name>/
   ```
3. Reference them from `TEST-REPORT.md` with relative paths (`./<flow-name>-plans.png`, etc.).

---

### Phase 7 — Final summary

After the browser test loop, print:

```
Files written:
  packages/onboarding/src/utils/flows.ts              (flow constant added)
  client/landing/stepper/declarative-flow/flows/<flow-name>/<flow-name>.ts
  client/landing/stepper/declarative-flow/flows/<flow-name>/README.md
  client/landing/stepper/declarative-flow/flows/<flow-name>/style.scss
  client/landing/stepper/declarative-flow/registered-flows.ts           (entry added)
  client/landing/stepper/declarative-flow/flows/<flow-name>/TEST-REPORT.md  (browser test report)

Flow URL (after deploy): /setup/<flow-name>
Browser test result: ✅ / ⚠️ / ❌  (copy from report)

Next steps:
  1. Open a draft PR targeting trunk and link the Linear issue / P2 in the description
  2. Add @Automattic/dotcom-stepper as reviewer (Stepper framework awareness)
```

If any customizations were flagged as requiring Engineering, also print:

```
Engineering requests needed before these customizations can be applied:
  • [step name]: [plain-English description of the prop to add]
    Where to ask: #dotcom-stepper, tag @Automattic/dotcom-stepper
    What to say: "[exact request text from Phase 3 preview]"
```

---

## Rules that override everything else

- **Never create new steps.** Only compose from existing `STEPS.*` constants in `steps.tsx`.
- **Never spread an existing flow** (`const myFlow = { ...otherFlow, ... }`).
- **Always include `STEPS.ERROR`** when `STEPS.PROCESSING` is in the flow.
- **Use `STEPS.UNIFIED_PLANS`**, not `STEPS.PLANS` (deprecated).
- **The flow `name` field must equal the exported constant value** (the string, e.g. `'my-flow'`), not the TypeScript identifier.
- **Never generate `useStepsProps` for a step that has no `accepts:` type** — it won't compile. Check AGENTS.md "Step customization" section first.
- **Be honest about limitations.** If a requested change isn't supported today, say so clearly in Phase 3 and generate the Engineering request text. Do not silently skip it or generate broken code.
