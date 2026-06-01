# Stepper — Signup & Onboarding Flow Framework

Wizard/walkthrough framework for WordPress.com signup and onboarding. Lives at
`client/landing/stepper/`. All new signup flows should be built here.
Support channel: `#dotcom-stepper`. Owner: `@Automattic/dotcom-stepper`.

## Directory structure

```
client/landing/stepper/
├── declarative-flow/
│   ├── flows/                    # One folder per flow (your work goes here)
│   │   ├── 00-example-flow/      # Canonical reference — read this first
│   │   ├── newsletter/           # Simple real-world example
│   │   └── onboarding/           # Main onboarding flow
│   ├── internals/
│   │   ├── steps.tsx             # THE canonical registry of all reusable steps
│   │   ├── steps-repository/     # Step React components
│   │   └── types.ts              # FlowV2, SubmitHandler, Navigate, StepperStep
│   └── registered-flows.ts       # Flow registry — every flow must be listed here
├── hooks/                        # Shared hooks (useCreateSite, useSiteSlug, etc.)
├── utils/                        # Utilities (stepsWithRequiredLogin, etc.)
└── README.md                     # Full human-readable docs
```

## Core concept

A flow is a **finite-state machine**, not a linear list. The first step is fixed; all
subsequent routing is decided by `useStepNavigation` based on what the user submitted.

**The golden rule: steps never navigate.** They only call `navigation.submit(data)`.
The flow (`useStepNavigation`) receives that data and calls `navigate('next-step-slug')`.

## The FlowV2 pattern

```ts
// packages/onboarding/src/utils/flows.ts — add your constant here
export const MY_FLOW = 'my-flow';

// client/landing/stepper/declarative-flow/flows/my-flow/my-flow.ts
import { MY_FLOW } from '@automattic/onboarding';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { useFlowState } from '../../internals/state-manager/store';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler } from '../../internals/types';

// 1. Define steps BEFORE the flow object (required for TypeScript inference).
function initialize() {
	return stepsWithRequiredLogin( [
		STEPS.GOALS,
		STEPS.DOMAIN_SEARCH,
		STEPS.UNIFIED_PLANS,
		STEPS.PROCESSING,
		STEPS.LAUNCHPAD,
		STEPS.ERROR,
	] );
}

// 2. The flow object.
const myFlow: FlowV2< typeof initialize > = {
	name: MY_FLOW, // must match the constant value exactly
	isSignupFlow: true, // true = fires calypso_signup_start Tracks event
	__experimentalUseSessions: true, // required when using useFlowState
	__experimentalUseBuiltinAuth: true, // optional: keep user inside Stepper for login
	initialize,

	useStepNavigation( _currentStep, navigate ) {
		const { get, set } = useFlowState();
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const createSite = useCreateSite();

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case 'goals':
					set( 'goals', providedDependencies );
					return navigate( 'domains' );
				case 'domains':
					set( 'domains', providedDependencies );
					return navigate( 'plans' );
				case 'plans':
					set( 'plans', providedDependencies );
					setPendingAction( () => createSite() );
					return navigate( 'processing' );
				case 'processing':
					if ( providedDependencies?.processingResult === ProcessingResult.SUCCESS ) {
						const site = get( 'site' );
						return navigate( 'launchpad' );
					}
					return navigate( 'error' );
			}
		};

		return { submit };
	},
};

export default myFlow;
```

## Available steps (reference `STEPS.*` from `../../internals/steps`)

### Signup / onboarding steps

| `STEPS.*` constant       | slug                   | Purpose                                                         |
| ------------------------ | ---------------------- | --------------------------------------------------------------- |
| `GOALS`                  | `goals`                | Ask user what they want to build (blog, store, portfolio, etc.) |
| `INTENT_STEP`            | `intent`               | Alternative intent/goal selector                                |
| `SEGMENTATION_SURVEY`    | `segmentation-survey`  | Survey to segment user by use case                              |
| `DESIGN_CHOICES`         | `design-choices`       | Choose between design options                                   |
| `DESIGN_SETUP`           | `design-setup`         | Select a theme / design                                         |
| `SITE_OPTIONS`           | `options`              | Set site title, tagline, icon                                   |
| `SETUP_BLOG`             | `setup-blog`           | Blog-specific setup step                                        |
| `BLOGGER_STARTING_POINT` | `bloggerStartingPoint` | Starting point for bloggers                                     |
| `BUSINESS_INFO`          | `businessInfo`         | Business details (name, category)                               |
| `STORE_ADDRESS`          | `storeAddress`         | WooCommerce store address                                       |
| `SITE_SPEC`              | `site-spec`            | AI-assisted site specification                                  |

### Domain steps

| `STEPS.*` constant    | slug                  | Purpose                                       |
| --------------------- | --------------------- | --------------------------------------------- |
| `DOMAIN_SEARCH`       | `domains`             | Search and pick a domain                      |
| `USE_MY_DOMAIN`       | `use-my-domain`       | Connect an existing domain                    |
| `DOMAIN_CONTACT_INFO` | `domain-contact-info` | ICANN contact details for domain registration |

### Plan / payment steps

| `STEPS.*` constant | slug    | Purpose                                                   |
| ------------------ | ------- | --------------------------------------------------------- |
| `UNIFIED_PLANS`    | `plans` | **Preferred** plan selector — use this for new flows      |
| `PLANS`            | `plans` | Legacy plan selector (deprecated; prefer `UNIFIED_PLANS`) |

### Site creation & processing

| `STEPS.*` constant   | slug                 | Purpose                                                          |
| -------------------- | -------------------- | ---------------------------------------------------------------- |
| `PROCESSING`         | `processing`         | Runs `setPendingAction`, shows progress bar, then submits result |
| `SITE_CREATION_STEP` | `create-site`        | Creates the site explicitly (use when you need a separate step)  |
| `FLEX_SITE_CREATION` | `flex-site-creation` | Flexible site creation variant                                   |
| `SITE_LAUNCH`        | `site-launch`        | Launches (un-privatizes) an existing site                        |

### Post-signup

| `STEPS.*` constant         | slug                       | Purpose                             |
| -------------------------- | -------------------------- | ----------------------------------- |
| `LAUNCHPAD`                | `launchpad`                | Post-creation checklist / dashboard |
| `CELEBRATION_STEP`         | `celebration-step`         | Congratulations screen              |
| `SUBSCRIBERS`              | `subscribers`              | Add newsletter subscribers          |
| `POST_CHECKOUT_ONBOARDING` | `post-checkout-onboarding` | Onboarding after checkout           |

### Newsletter-specific

| `STEPS.*` constant | slug              | Purpose                       |
| ------------------ | ----------------- | ----------------------------- |
| `NEWSLETTER_SETUP` | `newsletterSetup` | Newsletter name, description  |
| `NEWSLETTER_GOALS` | `newsletterGoals` | Newsletter monetization goals |
| `FREE_POST_SETUP`  | `freePostSetup`   | Free newsletter post setup    |

### Site picker / utility

| `STEPS.*` constant     | slug                   | Purpose                                     |
| ---------------------- | ---------------------- | ------------------------------------------- |
| `NEW_OR_EXISTING_SITE` | `new-or-existing-site` | Ask user to create new or use existing site |
| `SITES_CHECKER`        | `check-sites`          | Check whether user has existing sites       |
| `PICK_SITE`            | `site-picker`          | Pick from a list of existing sites          |
| `SITE_PICKER`          | `sitePicker`           | Single site picker variant                  |
| `TRIAL_ACKNOWLEDGE`    | `trialAcknowledge`     | User acknowledges trial conditions          |

### Error / system

| `STEPS.*` constant     | slug              | Purpose                                                          |
| ---------------------- | ----------------- | ---------------------------------------------------------------- |
| `ERROR`                | `error`           | Display an error message — always include in flows that can fail |
| `PROCESSING_COPY_SITE` | `processing-copy` | Processing variant for site copy flows                           |

### Import steps (migration flows)

| `STEPS.*` constant     | slug                  | Purpose                     |
| ---------------------- | --------------------- | --------------------------- |
| `IMPORT`               | `import`              | Entry point for site import |
| `IMPORTER_WORDPRESS`   | `importerWordpress`   | WordPress.org import        |
| `IMPORTER_BLOGGER`     | `importerBlogger`     | Blogger import              |
| `IMPORTER_MEDIUM`      | `importerMedium`      | Medium import               |
| `IMPORTER_SQUARESPACE` | `importerSquarespace` | Squarespace import          |
| `IMPORTER_SUBSTACK`    | `importerSubstack`    | Substack import             |
| `IMPORTER_WIX`         | `importerWix`         | Wix import                  |

### AI / other

| `STEPS.*` constant                    | slug                 | Purpose                        |
| ------------------------------------- | -------------------- | ------------------------------ |
| `LAUNCH_BIG_SKY`                      | `launch-big-sky`     | BigSky AI site builder         |
| `SETUP_YOUR_SITE_AI`                  | `setup-your-site-ai` | AI-assisted site setup         |
| `BLUEPRINT`                           | `blueprint`          | Blueprint template selection   |
| `READYMADE_TEMPLATE_GENERATE_CONTENT` | `generateContent`    | Generate content from template |

## Step customization — what the flow can change without touching step code

### How it works

A flow can pass custom props to any step via `useStepsProps()`. The TypeScript type system
enforces which props each step accepts — you cannot pass props a step doesn't declare.

```ts
const myFlow: FlowV2< typeof initialize > = {
	// ...
	useStepsProps() {
		return {
			[ STEPS.UNIFIED_PLANS.slug ]: {
				displayedIntervals: [ 'yearly', '2yearly' ],
				isInSignup: true,
			},
		};
	},
};
```

### Steps that accept customization props today

Most steps expose **no** flow-level props. Only `STEPS.UNIFIED_PLANS` has an `accepts:`
type defined. Every other step listed here has none — changes require Engineering.

#### `STEPS.UNIFIED_PLANS` (slug: `'plans'`)

| Prop                    | Type                                            | What it does                                                         |
| ----------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| `isInSignup`            | `boolean`                                       | `true` = signup pricing (free plan shown); `false` = upgrade pricing |
| `isStepperUpgradeFlow`  | `boolean`                                       | Enables upgrade-specific behavior in PlansFeaturesMain               |
| `selectedFeature`       | `string`                                        | Highlights a plan that includes this feature slug                    |
| `displayedIntervals`    | `('monthly'\|'yearly'\|'2yearly'\|'3yearly')[]` | Restricts which billing cycles are shown                             |
| `wrapperProps.hideBack` | `boolean`                                       | Hides the back button                                                |
| `wrapperProps.goBack`   | `() => void`                                    | Custom back button handler                                           |

Note: `hideFreePlan` and `headerText` exist on the underlying component but are **not**
exposed via `accepts` — they cannot be set from the flow without an Engineering PR.

### Store-based customizations (set in `initialize()`)

These affect step appearance without requiring `accepts:` props on the step.
Call them via `dispatch( ONBOARD_STORE )` inside `initialize()`.

| Call                                         | Effect                                                           |
| -------------------------------------------- | ---------------------------------------------------------------- |
| `setHidePlansFeatureComparison( true )`      | Hides the plan feature comparison table in `STEPS.UNIFIED_PLANS` |
| `setIntent( Onboard.SiteIntent.Newsletter )` | Switches copy in intent-aware steps (site-options, etc.)         |
| `setIntent( Onboard.SiteIntent.Build )`      | Generic "build a site" intent                                    |
| `setIntent( Onboard.SiteIntent.Sell )`       | Store intent — changes site-options labels                       |
| `setIntent( Onboard.SiteIntent.Write )`      | Blog intent                                                      |
| `clearSignupDestinationCookie()`             | Ensures a fresh signup start (no redirect leftovers)             |

```ts
// Example: newsletter-style flow with plan comparison hidden
import { Onboard, OnboardActions } from '@automattic/data-stores';
import { dispatch } from '@wordpress/data';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import { ONBOARD_STORE } from '../../../stores';

function initialize() {
	const { setHidePlansFeatureComparison, setIntent } = dispatch( ONBOARD_STORE ) as OnboardActions;
	setHidePlansFeatureComparison( true );
	setIntent( Onboard.SiteIntent.Newsletter );
	clearSignupDestinationCookie();

	return stepsWithRequiredLogin( [
		STEPS.NEWSLETTER_SETUP,
		STEPS.DOMAIN_SEARCH,
		STEPS.UNIFIED_PLANS,
		STEPS.PROCESSING,
		STEPS.LAUNCHPAD,
		STEPS.ERROR,
	] );
}
```

### What requires an Engineering PR

To add customisation props (copy, hidden options, etc.) to a step that doesn't have
them yet, a dev must:

1. Open the step component file in `steps-repository/<step-name>/index.tsx`.
2. Change `Step< { submits: ... } >` to `Step< { submits: ..., accepts: { myProp?: string } } >`.
3. Use the prop inside the component.
4. TypeScript then automatically surfaces `myProp` in `useStepsProps()` return type.

When you need a prop that doesn't exist yet, file a request with the step name, the
prop name, its type, and what it should do.

## Authentication

Wrap steps that require a logged-in user with `stepsWithRequiredLogin()`. Stepper
injects the user registration/login step automatically — you don't build it yourself.

```ts
// Gate ALL steps (most signup flows)
function initialize() {
	return stepsWithRequiredLogin( [
		STEPS.GOALS,
		STEPS.DOMAIN_SEARCH,
		STEPS.UNIFIED_PLANS,
		STEPS.PROCESSING,
	] );
}

// Gate SOME steps (allow browsing before login)
function initialize() {
	return [
		STEPS.GOALS,
		...stepsWithRequiredLogin( [ STEPS.DOMAIN_SEARCH, STEPS.UNIFIED_PLANS, STEPS.PROCESSING ] ),
	] as const;
}
```

## State management

Use `useFlowState()` inside `useStepNavigation`. Requires `__experimentalUseSessions: true`.

```ts
const { get, set } = useFlowState();
set( 'domains', providedDependencies ); // persist submitted data by step slug
const domains = get( 'domains' ); // retrieve it later
```

Types are inferred from the step's `submits:` type definition — no manual typing needed.

## Site creation

Use the `useCreateSite()` hook + `setPendingAction()` so that `STEPS.PROCESSING` runs
it and shows a progress bar:

```ts
switch ( slug ) {
	case 'plans':
		set( 'plans', providedDependencies );
		setPendingAction( () =>
			createSite( {
				siteIntent: Onboard.SiteIntent.Build,
				theme: 'pub/blockbase',
			} )
		);
		return navigate( 'processing' );
}
```

The `STEPS.PROCESSING` step submits `{ processingResult, siteId, siteSlug, goToCheckout, goToHome }`.
If `goToCheckout` is true, redirect to `/checkout/<siteSlug>?redirect_to=<destination>&signup=1`.

## Common flow patterns

### Minimal signup (goals → domain → plans → processing → launchpad)

```ts
function initialize() {
	return stepsWithRequiredLogin( [
		STEPS.GOALS,
		STEPS.DOMAIN_SEARCH,
		STEPS.UNIFIED_PLANS,
		STEPS.PROCESSING,
		STEPS.LAUNCHPAD,
		STEPS.ERROR,
	] );
}
```

### With use-my-domain fallback

```ts
function initialize() {
	return stepsWithRequiredLogin( [
		STEPS.DOMAIN_SEARCH,
		STEPS.USE_MY_DOMAIN,
		STEPS.UNIFIED_PLANS,
		STEPS.PROCESSING,
		STEPS.LAUNCHPAD,
		STEPS.ERROR,
	] );
}
// In useStepNavigation:
switch ( slug ) {
	case 'domains':
		if ( providedDependencies?.shouldUseTheDomainForSite ) {
			return navigate(
				`use-my-domain?${ new URLSearchParams( { siteSlug: providedDependencies.siteSlug } ) }`
			);
		}
		return navigate( 'plans' );
}
```

### Gating access (agency-only, etc.)

```ts
async function initialize() {
	const hasAccess = await checkAccess();
	if ( ! hasAccess ) {
		window.location.replace( '/home' );
		return false; // halts Stepper immediately
	}
	return stepsWithRequiredLogin( [ STEPS.DOMAIN_SEARCH ] );
}
```

## How to add a new flow (four touchpoints)

### 1. Add flow constant

Add the flow constant in `packages/onboarding/src/utils/flows.ts`:

```ts
export const MY_FLOW = 'my-flow';
```

### 2. Create the flow folder

Create `client/landing/stepper/declarative-flow/flows/my-flow/` with:

- `my-flow.ts` — flow definition (see pattern above)
- `README.md` — description + testing steps + owner + context link
- `style.scss` — flow-specific styles (import from the flow file if needed)

### 3. Register the flow

Register it in `client/landing/stepper/declarative-flow/registered-flows.ts`:

```ts
import { MY_FLOW } from '@automattic/onboarding';

const registeredFlows = {
	[ MY_FLOW ]: () => import( /* webpackChunkName: "my-flow" */ './flows/my-flow/my-flow' ),
};
```

### 4. Verify the route

The flow is accessible at `/setup/my-flow` after deployment.

## Common pitfalls

1. **`isSignupFlow: false` on actual signup flows** — If your flow creates a site or
   signs up a user, set `isSignupFlow: true`. It controls `calypso_signup_start` Tracks
   events and some framework behavior.

2. **`useFlowState` without `__experimentalUseSessions: true`** — The hook will silently
   not persist. Always set the flag when using `useFlowState`.

3. **Calling `navigate()` inside a step** — Steps must never call `navigate` directly.
   They call `navigation.submit(data)`. The flow's `useStepNavigation` calls `navigate`.

4. **Using `STEPS.PLANS` instead of `STEPS.UNIFIED_PLANS`** — `PLANS` is deprecated.
   Use `UNIFIED_PLANS` for all new flows.

5. **Not including `STEPS.ERROR`** — Always include it. If `STEPS.PROCESSING` fails
   (network error, API error), you need somewhere to send the user.

6. **Spreading flows** (`const flow = { ...otherFlow, ... }`) — Never do this unless
   you own both flows. Step slug collisions and type errors will silently break things.

7. **Forgetting `as const`** — If `initialize` returns a plain array (not using
   `stepsWithRequiredLogin`), add `as const` at the end so TypeScript infers the
   literal step slugs, like `return [ STEPS.GOALS, STEPS.PROCESSING ] as const;`.
   `stepsWithRequiredLogin()` handles this for you.

8. **Not registering in `registered-flows.ts`** — The flow won't exist. The URL
   `/setup/my-flow` will 404.

9. **Using `window.location.href` vs `navigate()`** — Use `navigate()` for steps within
   the same flow. Use `window.location.replace()` when redirecting outside Stepper
   (checkout, /home, external URLs).

10. **Style bleed** — Put flow-specific CSS in the flow's `style.scss`, not in
    `global.scss` or step files. Steps style themselves; flows style the frame.

## README template for new flows

```text
# <Flow name>

<One sentence: what this flow does and who it's for.>

## Testing instructions

1. Go to /setup/<flow-slug>.
2. <step-by-step happy path>
3. Verify: <what success looks like>

## Owned by

@<team-slug>

## Context

<Link to P2 post or Linear issue>
```
