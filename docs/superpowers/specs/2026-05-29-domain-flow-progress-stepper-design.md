# Domain Flow Progress Stepper — Design Spec

**Date**: 2026-05-29
**Branch**: `update/domain-flow-stepper`
**Status**: Approved, ready for implementation

## Goal

Add a 3-step horizontal progress indicator to the domain purchase flow so users can see where they are across all three stages: domain selection, plan selection, and checkout. This is a prototype to validate that the new `@automattic/ui` `HorizontalStepper` component works correctly in a real flow context.

## Flow Steps

| Step | Label | URL |
|------|-------|-----|
| 1 | Select a domain | `/setup/domain/domains` |
| 2 | Select a plan | `/setup/domain/plans` |
| 3 | Complete payment | `/checkout/<siteSlug>` |

## Visual Design

The stepper uses `indicatorVariant='number'` (numbered circles). States per step:

- **Active**: filled dark circle, white number, bold label
- **Completed**: checkmark icon in circle
- **Inactive**: outlined circle, muted number and label

The stepper sits between the top bar and the page heading — placed as the first element inside the `heading` prop of `Step.CenteredColumnLayout` (and equivalently inside the checkout first column), stacked above the existing page heading text.

## Component: `DomainFlowProgressStepper`

**File**: `client/landing/stepper/declarative-flow/flows/domain/components/domain-flow-progress-stepper.tsx`

### Props

```ts
type Props = {
  currentStep: 'domains' | 'plans' | 'checkout';
};
```

### Step status derivation

| `currentStep` | Step 1 status | Step 2 status | Step 3 status |
|---------------|---------------|---------------|---------------|
| `'domains'`   | active        | inactive      | inactive      |
| `'plans'`     | completed     | active        | inactive      |
| `'checkout'`  | completed     | completed     | active        |

### Import aliasing

`HorizontalStepper` is imported as `UIStepper` to avoid naming collision with the declarative flow framework's own "Stepper" concept:

```ts
import { HorizontalStepper as UIStepper } from '@automattic/ui';
```

### Behavior

- `linear={true}` — future steps are not clickable
- `onValueChange` is a no-op — the flow drives navigation, not the stepper
- The stepper is display-only (progress indicator, not navigation)
- No panels — this stepper has no `children` content

## Changes by File

### 1. New file — `DomainFlowProgressStepper` component

`client/landing/stepper/declarative-flow/flows/domain/components/domain-flow-progress-stepper.tsx`

New component as described above.

### 2. Domain search step

`client/landing/stepper/declarative-flow/internals/steps-repository/domain-search/index.tsx`

Inside the `shouldUseStepContainerV2( flow )` branch, modify the `heading` prop of `Step.CenteredColumnLayout`. Guard with `isDomainFlow( flow )`:

```tsx
heading={
  <>
    { isDomainFlow( flow ) && <DomainFlowProgressStepper currentStep="domains" /> }
    <Step.Heading text={ headerText } subText={ subHeaderText } />
  </>
}
```

### 3. Unified plans step

`client/landing/stepper/declarative-flow/internals/steps-repository/unified-plans/unified-plans-step.tsx`

Same pattern as domain search, guarded by `isDomainFlow( flowName )`, with `currentStep="plans"`.

The exact insertion point depends on the plans step's v2 layout structure (to be confirmed during implementation).

### 4. Domain flow — pass `flow` param to checkout

`client/landing/stepper/declarative-flow/flows/domain/domain.ts`

Add `flow: DOMAIN_FLOW` to every `addQueryArgs` call that navigates to `/checkout/`. This gives checkout an explicit, stable signal without relying on fragile URL pattern matching.

### 5. Checkout

`client/my-sites/checkout/src/components/checkout-main-content.tsx`

Detect domain flow via `searchParams.get( 'flow' ) === DOMAIN_FLOW`. Import `DOMAIN_FLOW` from `@automattic/onboarding` (already imported in this file via `Step`).

Render `DomainFlowProgressStepper` with `currentStep="checkout"` above the `<Step.Heading text="Checkout" />` in the large-viewport layout path only. Mobile is out of scope for this prototype.

## Out of Scope

- Automated tests (planned for a follow-up)
- Mobile layout for checkout step
- Any other flow (only `isDomainFlow` is affected)
- Back-navigation via the stepper (flow handles all navigation)

## Notes

- The existing `steps_current` / `steps_total` query params in checkout are for a separate mobile-only `Step.StepCounter` used by other flows. The new `flow` param does not conflict with them.
- This is a prototype on a branch (`update/domain-flow-stepper`) that is not yet merged, intentionally branched off an unstable stepper branch to validate the component in a real flow context.
