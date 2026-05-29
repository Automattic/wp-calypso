# Domain Flow Progress Stepper — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3-step horizontal progress indicator to the domain purchase flow showing progress across domain selection, plan selection, and checkout.

**Architecture:** A new `DomainFlowProgressStepper` component uses `@automattic/ui` Stepper primitives (aliased as `UIStepper`) to render a display-only 3-step horizontal indicator. It sits in the `heading` prop of each step's layout component — between the top bar and page content — guarded by `isDomainFlow()`. The checkout page detects the domain flow via a `flow=domain` query param and shows the stepper in the same heading slot.

**Tech Stack:** React, TypeScript, CSS Modules, `@automattic/ui` Stepper primitives, `@automattic/onboarding` Step layouts, `@wordpress/react-i18n`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `client/landing/stepper/declarative-flow/flows/domain/components/domain-flow-progress-stepper.tsx` | The progress stepper component |
| Create | `client/landing/stepper/declarative-flow/flows/domain/components/style.module.scss` | Layout styles for the stepper |
| Modify | `client/landing/stepper/declarative-flow/internals/steps-repository/domain-search/index.tsx` | Add stepper to heading slot |
| Modify | `client/landing/stepper/declarative-flow/internals/steps-repository/unified-plans/unified-plans-step.tsx` | Add stepper to heading slot |
| Modify | `client/landing/stepper/declarative-flow/flows/domain/domain.ts` | Pass `flow=domain` to checkout URL |
| Modify | `client/my-sites/checkout/src/components/checkout-main-content.tsx` | Detect domain flow and render stepper |

---

## Task 1: Create `DomainFlowProgressStepper` component

**Files:**
- Create: `client/landing/stepper/declarative-flow/flows/domain/components/domain-flow-progress-stepper.tsx`
- Create: `client/landing/stepper/declarative-flow/flows/domain/components/style.module.scss`

**Notes:**
- `@automattic/ui` is already in `client/package.json` as a workspace dependency — no package.json change needed.
- `Stepper` (the namespace object) is aliased as `UIStepper` to avoid naming collision with the declarative flow's own "Stepper" concept throughout the codebase.
- Stepper primitives are used directly (not `HorizontalStepper`) so no empty panels are rendered — this is a display-only indicator with no panel content.
- `linear={true}` disables future (non-completed, non-active) steps. `onValueChange` is a no-op because the flow drives navigation, not the stepper.

- [ ] **Step 1: Write the CSS module**

```scss
/* client/landing/stepper/declarative-flow/flows/domain/components/style.module.scss */
.root {
	display: flex;
	justify-content: center;
	padding: 8px 0;
}

.step {
	display: flex;
	justify-content: center;
}

.trigger {
	align-items: center;
	padding: 12px 16px;
}
```

- [ ] **Step 2: Write the component**

```tsx
// client/landing/stepper/declarative-flow/flows/domain/components/domain-flow-progress-stepper.tsx
import { Stepper as UIStepper } from '@automattic/ui';
import { useI18n } from '@wordpress/react-i18n';
import styles from './style.module.scss';

type Props = {
	currentStep: 'domains' | 'plans' | 'checkout';
};

export function DomainFlowProgressStepper( { currentStep }: Props ) {
	const { __ } = useI18n();

	const step1Status = currentStep !== 'domains' ? ( 'completed' as const ) : undefined;
	const step2Status = currentStep === 'checkout' ? ( 'completed' as const ) : undefined;

	return (
		<UIStepper.Root
			orientation="horizontal"
			value={ currentStep }
			onValueChange={ () => {} }
			aria-label={ __( 'Purchase steps' ) }
			indicatorVariant="number"
			linear
			className={ styles.root }
		>
			<UIStepper.List>
				<UIStepper.Step value="domains" status={ step1Status } className={ styles.step }>
					<UIStepper.Trigger className={ styles.trigger }>
						<UIStepper.Indicator />
						<UIStepper.Title>{ __( 'Select a domain' ) }</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
				<UIStepper.Step value="plans" status={ step2Status } className={ styles.step }>
					<UIStepper.Trigger className={ styles.trigger }>
						<UIStepper.Indicator />
						<UIStepper.Title>{ __( 'Select a plan' ) }</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
				<UIStepper.Step value="checkout" className={ styles.step }>
					<UIStepper.Trigger className={ styles.trigger }>
						<UIStepper.Indicator />
						<UIStepper.Title>{ __( 'Complete payment' ) }</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
			</UIStepper.List>
		</UIStepper.Root>
	);
}
```

- [ ] **Step 3: Type-check the new file**

```bash
yarn typecheck-client 2>&1 | grep -i "domain-flow-progress-stepper"
```

Expected: no output (no errors for this file).

- [ ] **Step 4: Commit**

```bash
git add client/landing/stepper/declarative-flow/flows/domain/components/
git commit -m "feat(domain-flow): add DomainFlowProgressStepper component"
```

---

## Task 2: Add stepper to domain search step

**Files:**
- Modify: `client/landing/stepper/declarative-flow/internals/steps-repository/domain-search/index.tsx`

**Context:** The `shouldUseStepContainerV2( flow )` branch (around line 392) renders `<Step.CenteredColumnLayout ... heading={...}>`. The `heading` prop currently holds a conditional `<Step.Heading>` that goes `undefined` when on mobile with an active query (to let the domain search overlay fill the screen). Add the stepper above `Step.Heading`, guarded by `isDomainFlow( flow )`.

- [ ] **Step 1: Add import for DomainFlowProgressStepper**

In `domain-search/index.tsx`, add after the last existing import:

```tsx
import { DomainFlowProgressStepper } from '../../../flows/domain/components/domain-flow-progress-stepper';
```

- [ ] **Step 2: Update the heading prop**

Find `<Step.CenteredColumnLayout` in the `shouldUseStepContainerV2( flow )` branch (around line 483). The current `heading` prop is:

```tsx
heading={
  // On mobile, once the user has searched the persistent fixed
  // search overlay (rendered by @automattic/domain-search) is the
  // page's primary affordance — the H1/subText are dropped so
  // high-quality results can fill the limited vertical space.
  // The empty/initial state keeps the heading on mobile.
  isMobileViewport && query ? undefined : (
    <Step.Heading text={ headerText } subText={ subHeaderText } />
  )
}
```

Replace it with:

```tsx
heading={
  <>
    { isDomainFlow( flow ) && <DomainFlowProgressStepper currentStep="domains" /> }
    { ! ( isMobileViewport && query ) && (
      <Step.Heading text={ headerText } subText={ subHeaderText } />
    ) }
  </>
}
```

- [ ] **Step 3: Type-check**

```bash
yarn typecheck-client 2>&1 | grep -i "domain-search"
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add client/landing/stepper/declarative-flow/internals/steps-repository/domain-search/index.tsx
git commit -m "feat(domain-flow): show progress stepper on domain search step"
```

---

## Task 3: Add stepper to unified plans step

**Files:**
- Modify: `client/landing/stepper/declarative-flow/internals/steps-repository/unified-plans/unified-plans-step.tsx`

**Context:** The `useStepContainerV2 && wrapperProps` branch (around line 683) renders `<Step.WideLayout ... heading={...}>`. The heading currently contains an optional `<IntentToggle>` followed by `<Step.Heading>`. Add the stepper before both, guarded by `isDomainFlow( flowName )`.

- [ ] **Step 1: Check isDomainFlow is imported**

Look at the import block at the top of `unified-plans-step.tsx`. Verify `isDomainFlow` is imported from `@automattic/onboarding`:

```tsx
import {
  DOMAIN_FLOW,
  isDomainFlow,
  // ... other imports
} from '@automattic/onboarding';
```

If `isDomainFlow` is missing, add it to that import line.

- [ ] **Step 2: Add import for DomainFlowProgressStepper**

After the existing imports in `unified-plans-step.tsx`, add:

```tsx
import { DomainFlowProgressStepper } from '../../../flows/domain/components/domain-flow-progress-stepper';
```

- [ ] **Step 3: Update the heading prop**

Find `heading={` inside the `<Step.WideLayout` block (around line 730). The current heading is:

```tsx
heading={
  <>
    { ( intent === 'plans-website-builder' ||
      intent === 'plans-wordpress-hosting' ) && (
      <IntentToggle
        currentIntent={ intent }
        onIntentChange={ ( newIntent ) => {
          onIntentChange?.( newIntent );
        } }
      />
    ) }
    <Step.Heading text={ getHeaderText() } subText={ fallbackSubHeaderText } />
  </>
}
```

Replace with:

```tsx
heading={
  <>
    { isDomainFlow( flowName ) && <DomainFlowProgressStepper currentStep="plans" /> }
    { ( intent === 'plans-website-builder' ||
      intent === 'plans-wordpress-hosting' ) && (
      <IntentToggle
        currentIntent={ intent }
        onIntentChange={ ( newIntent ) => {
          onIntentChange?.( newIntent );
        } }
      />
    ) }
    <Step.Heading text={ getHeaderText() } subText={ fallbackSubHeaderText } />
  </>
}
```

- [ ] **Step 4: Type-check**

```bash
yarn typecheck-client 2>&1 | grep -i "unified-plans-step"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add client/landing/stepper/declarative-flow/internals/steps-repository/unified-plans/unified-plans-step.tsx
git commit -m "feat(domain-flow): show progress stepper on plans step"
```

---

## Task 4: Pass `flow` param to checkout URL in domain flow

**Files:**
- Modify: `client/landing/stepper/declarative-flow/flows/domain/domain.ts`

**Context:** Two code paths navigate to `/checkout/` in `domain.ts`:
1. The `goToCheckout` helper function (around line 105) — used when `goToCheckout: true` comes from the PROCESSING case and SITE_PICKER case.
2. A direct `window.location.assign` in the `DOMAIN_SEARCH` case (around line 196) — when the site already has a paid plan and skips processing.

`DOMAIN_FLOW` is already imported at the top of the file. Add `flow: DOMAIN_FLOW` to both `addQueryArgs` calls so checkout can detect which flow sent the user there.

- [ ] **Step 1: Update goToCheckout helper**

Find the `goToCheckout` function. Its `window.location.replace( addQueryArgs( ... ) )` call (around line 142) currently reads:

```tsx
return window.location.replace(
  addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
    redirect_to: destination,
    signup: 1,
    cancel_to: new URL(
      addQueryArgs( '/setup/domain', {
        siteSlug,
        redirect_to: redirectTo,
        ...( backTo && { back_to: backTo } ),
        ...( dashboard && { dashboard } ),
      } ),
      window.location.href
    ).href,
  } )
);
```

Add `flow: DOMAIN_FLOW` to the params object:

```tsx
return window.location.replace(
  addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
    redirect_to: destination,
    signup: 1,
    flow: DOMAIN_FLOW,
    cancel_to: new URL(
      addQueryArgs( '/setup/domain', {
        siteSlug,
        redirect_to: redirectTo,
        ...( backTo && { back_to: backTo } ),
        ...( dashboard && { dashboard } ),
      } ),
      window.location.href
    ).href,
  } )
);
```

- [ ] **Step 2: Update direct checkout navigation in DOMAIN_SEARCH case**

Find the `window.location.assign( addQueryArgs( ... ) )` inside the `DOMAIN_SEARCH` case (around line 196) — the one that fires when the site already has a paid plan. It currently reads:

```tsx
return window.location.assign(
  addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
    redirect_to: redirectTo || defaultRedirect,
    signup: 0,
    cancel_to: new URL(
      addQueryArgs( '/setup/domain', {
        siteSlug,
        redirect_to: redirectTo,
        ...( backTo && { back_to: backTo } ),
        ...( dashboard && { dashboard } ),
      } ),
      window.location.href
    ).href,
  } )
);
```

Add `flow: DOMAIN_FLOW`:

```tsx
return window.location.assign(
  addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
    redirect_to: redirectTo || defaultRedirect,
    signup: 0,
    flow: DOMAIN_FLOW,
    cancel_to: new URL(
      addQueryArgs( '/setup/domain', {
        siteSlug,
        redirect_to: redirectTo,
        ...( backTo && { back_to: backTo } ),
        ...( dashboard && { dashboard } ),
      } ),
      window.location.href
    ).href,
  } )
);
```

- [ ] **Step 3: Commit**

```bash
git add client/landing/stepper/declarative-flow/flows/domain/domain.ts
git commit -m "feat(domain-flow): pass flow=domain to checkout URL for stepper detection"
```

---

## Task 5: Add stepper to checkout page

**Files:**
- Modify: `client/my-sites/checkout/src/components/checkout-main-content.tsx`

**Context:** Checkout renders `<Step.TwoColumnLayout ... heading={...}>` (around line 1041). `TwoColumnLayout` already has a `heading` prop that renders a centered row between the TopBar and the two-column content. The component has `isLargeViewport` available from `useViewportMatch`. The stepper only renders on large viewport (desktop), matching the mockup.

The existing `const searchParams = new URLSearchParams( window.location.search )` (around line 432) is the right place to read the `flow` param.

- [ ] **Step 1: Add DOMAIN_FLOW to the existing @automattic/onboarding import**

Find the import from `@automattic/onboarding` in `checkout-main-content.tsx`:

```tsx
import { Step } from '@automattic/onboarding';
```

Change to:

```tsx
import { DOMAIN_FLOW, Step } from '@automattic/onboarding';
```

- [ ] **Step 2: Add DomainFlowProgressStepper import**

After the existing import block, add:

```tsx
import { DomainFlowProgressStepper } from 'calypso/landing/stepper/declarative-flow/flows/domain/components/domain-flow-progress-stepper';
```

- [ ] **Step 3: Derive isDomainFlowCheckout**

After the existing line:

```tsx
const searchParams = new URLSearchParams( window.location.search );
```

Add directly below it:

```tsx
const isDomainFlowCheckout = searchParams.get( 'flow' ) === DOMAIN_FLOW;
```

- [ ] **Step 4: Add heading prop to TwoColumnLayout**

Find `<Step.TwoColumnLayout` (around line 1041). It currently starts:

```tsx
<Step.TwoColumnLayout
  firstColumnWidth={ 8 }
  secondColumnWidth={ 4 }
  topBar={ ( { isLargeViewport } ) => {
```

Add the `heading` prop between `secondColumnWidth` and `topBar`:

```tsx
<Step.TwoColumnLayout
  firstColumnWidth={ 8 }
  secondColumnWidth={ 4 }
  heading={
    isDomainFlowCheckout && isLargeViewport ? (
      <DomainFlowProgressStepper currentStep="checkout" />
    ) : undefined
  }
  topBar={ ( { isLargeViewport } ) => {
```

- [ ] **Step 5: Type-check**

```bash
yarn typecheck-client 2>&1 | grep -i "checkout-main-content"
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add client/my-sites/checkout/src/components/checkout-main-content.tsx
git commit -m "feat(domain-flow): show progress stepper on checkout step"
```

---

## Manual Verification

Start the dev server:

```bash
yarn start
```

Then verify the following in a browser:

| Page | URL pattern | Expected stepper state |
|------|-------------|------------------------|
| Domain search | `/setup/domain/domains` | Step 1 filled dark circle, steps 2 and 3 outlined |
| Plans | `/setup/domain/plans` | Step 1 checkmark, step 2 filled dark circle, step 3 outlined |
| Checkout | `/checkout/<siteSlug>?flow=domain&...` | Steps 1 and 2 checkmarks, step 3 filled dark circle |
| Other flows (onboarding, new-hosted-site) | any | Stepper NOT visible |
