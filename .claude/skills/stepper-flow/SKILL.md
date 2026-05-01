# /stepper-flow

Generate a new Stepper signup flow from a plain-English description.

Produces PR-ready files: the flow TypeScript, README, style.scss, the flow constant,
and registration entry. No new steps are created — only existing steps are composed.

---

## Instructions

When this skill is invoked, follow these steps in order.

### Step 1 — Load context

Read these files before doing anything else:

- `client/landing/stepper/AGENTS.md` — framework rules, step table, patterns, pitfalls
- `client/landing/stepper/declarative-flow/internals/steps.tsx` — authoritative list of available steps
- `client/landing/stepper/declarative-flow/registered-flows.ts` — existing flow names (avoid collisions)
- `packages/onboarding/src/utils/flows.ts` — existing flow constants (avoid collisions)
- `client/landing/stepper/declarative-flow/flows/00-example-flow/example.ts` — canonical reference flow

### Step 2 — Interview the user

Ask all of these questions in a single message. Do not proceed until you have answers.

```
1. Flow name (kebab-case slug, e.g. `hosting-pro`). Must be unique — check registered-flows.ts.
2. What is this flow for? (one sentence — goes in README and PR description)
3. Describe the user journey in plain English.
   Example: "User picks a goal, searches for a domain, selects a plan, site is created, then sees the launchpad."
4. Should any steps be skipped for already-logged-in users? (default: yes, login is always gated via stepsWithRequiredLogin)
5. Does the flow need to check access before running (e.g. agency-only, feature-flagged)? If yes, describe the condition.
6. Any steps that should receive custom props from the flow (e.g. hide the free plan, custom title text)?
7. Who owns this flow? (team slug or @handle for the README)
8. Linear issue or P2 link for context (optional, for README)
```

### Step 3 — Map the journey to steps

Using the step table in AGENTS.md:

- Map each plain-English step to one or more `STEPS.*` constants from `steps.tsx`.
- Verify each chosen step actually exists in `steps.tsx` before using it.
- Always include `STEPS.ERROR` for any flow that uses `STEPS.PROCESSING`.
- The slug in each `case` of `useStepNavigation` must match the step's `slug` field in `steps.tsx`, not the `STEPS.*` key name.
- Show the user the proposed step sequence and ask for confirmation before writing files.

### Step 4 — Write the files

Write all files. Do not ask for permission for each one — write them all, then summarise.

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
- Always use `stepsWithRequiredLogin()` — do not build bare step arrays unless the user explicitly needs pre-auth steps.
- Set `__experimentalUseSessions: true` whenever `useFlowState` is used.
- Every step slug in the `switch` must be a `case` — do not use `default` as a catch-all for navigation.
- The `submit` handler must return or break on every case — no fall-through.
- For `STEPS.PROCESSING` submissions: check `providedDependencies?.processingResult === ProcessingResult.SUCCESS`. On success, redirect using `window.location.replace()`. On failure, `navigate('error')`.
- Use `window.location.replace()` (not `.href`) to avoid a back-button loop after checkout or /home redirects.

#### 4c. README

File: `client/landing/stepper/declarative-flow/flows/<flow-name>/README.md`

Use the README template from AGENTS.md. Write 3–5 concrete testing steps including the happy path and at least one edge case (e.g. "pick the free plan").

#### 4d. Style

File: `client/landing/stepper/declarative-flow/flows/<flow-name>/style.scss`

Create an empty file with a single comment:
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

### Step 5 — Summarise

After writing all files, print:

```
Files written:
  packages/onboarding/src/utils/flows.ts              (flow constant added)
  client/landing/stepper/declarative-flow/flows/<flow-name>/<flow-name>.ts
  client/landing/stepper/declarative-flow/flows/<flow-name>/README.md
  client/landing/stepper/declarative-flow/flows/<flow-name>/style.scss
  client/landing/stepper/declarative-flow/registered-flows.ts           (entry added)

Flow URL (after deploy): /setup/<flow-name>

Next steps:
  1. yarn typecheck-client — verify TypeScript compiles cleanly
  2. Start dev server (yarn start) and visit /setup/<flow-name> to smoke-test
  3. Open a draft PR targeting trunk; link the Linear issue / P2 in the description
  4. Add @alshakero as reviewer for Stepper framework awareness
```

---

## Rules that override everything else

- **Never create new steps.** Only compose from existing `STEPS.*` constants in `steps.tsx`.
- **Never spread an existing flow** (`const myFlow = { ...otherFlow, ... }`).
- **Always include `STEPS.ERROR`** when `STEPS.PROCESSING` is in the flow.
- **Use `STEPS.UNIFIED_PLANS`**, not `STEPS.PLANS` (deprecated).
- **The flow `name` field must equal the exported constant value** (the string, e.g. `'my-flow'`), not the TypeScript identifier.
- If the user's description requires a step that does not exist in `steps.tsx`, tell them which step is the closest match and ask if it's acceptable. Do not invent step slugs.
