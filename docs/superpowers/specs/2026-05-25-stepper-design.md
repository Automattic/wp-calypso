# Stepper Component — Design Spec

**Date:** 2026-05-25
**Package:** `@automattic/ui`
**Status:** Approved for implementation

---

## Overview

The Stepper communicates progress through a sequence of steps and allows navigation between them. Two orientations are supported:

- **Vertical**: accordion pattern — each step header expands its content panel inline.
- **Horizontal**: tabs pattern — step headers form a row; the active panel appears below.

These orientations produce fundamentally different DOM structures and ARIA semantics, addressed through a two-tier architecture.

### Core principle

Stepper is not a single ARIA pattern. It is a composition of existing patterns — accordion for vertical, tabs for horizontal — unified under a shared state model.

---

## Architecture

### Two-tier design

| Tier   | Components                             | Target audience                                      |
| ------ | -------------------------------------- | ---------------------------------------------------- |
| Tier 1 | `VerticalStepper`, `HorizontalStepper` | Most consumers — uniform JSX for both orientations   |
| Tier 2 | `Stepper.*` primitives                 | Advanced consumers — full control over DOM structure |

Tier 1 is implemented using Tier 2 primitives. Both tiers are shipped together in the initial release.

### Base UI dependency

`@base-ui/react` is added as a dependency to `packages/ui`. The stepper wraps:

- `Accordion.*` from Base UI for vertical orientation
- `Tabs.*` from Base UI for horizontal orientation

The stepper context layer (step registration, status tracking, linear flow, indicator counting, `formatStepLabel`) sits on top of whichever Base UI primitive is active.

---

## File Structure

```
packages/ui/src/
├── stepper/
│   ├── index.ts              # Stepper.* namespace exports
│   ├── types.ts              # all shared types
│   ├── context.tsx           # StepperContext + StepContext
│   ├── root.tsx              # Stepper.Root
│   ├── list.tsx              # Stepper.List (horizontal only)
│   ├── step.tsx              # Stepper.Step
│   ├── trigger.tsx           # Stepper.Trigger
│   ├── panel.tsx             # Stepper.Panel
│   ├── indicator.tsx         # Stepper.Indicator
│   ├── title.tsx             # Stepper.Title
│   ├── description.tsx       # Stepper.Description
│   ├── use-step-registration.ts
│   ├── style.module.scss
│   ├── stories/
│   │   └── index.stories.tsx
│   └── test/
│       └── index.tsx
├── vertical-stepper/
│   ├── index.ts
│   ├── vertical-stepper.tsx
│   ├── vertical-stepper-step.tsx
│   ├── style.module.scss
│   ├── stories/
│   │   └── index.stories.tsx
│   └── test/
│       └── index.tsx
└── horizontal-stepper/
    ├── index.ts
    ├── horizontal-stepper.tsx
    ├── horizontal-stepper-step.tsx
    ├── style.module.scss
    ├── stories/
    │   └── index.stories.tsx
    └── test/
        └── index.tsx
```

`src/index.ts` gains three exports: `VerticalStepper`, `HorizontalStepper`, and `Stepper`.

---

## API Surface

### Shared utility type

```ts
type RequireOneOf< T, Keys extends keyof T > = Omit< T, Keys > &
	{
		[ K in Keys ]-?: Required< Pick< T, K > > & Partial< Record< Exclude< Keys, K >, never > >;
	}[ Keys ];
```

Defined in `stepper/types.ts`.

### `VerticalStepper` / `HorizontalStepper`

```ts
type StepperProps = RequireOneOf<
	{
		'aria-label'?: string;
		'aria-labelledby'?: string;
		value?: string;
		defaultValue?: string;
		onValueChange?: ( value: string ) => void;
		linear?: boolean; // default: false
		headingLevel?: 2 | 3 | 4 | 5 | 6; // VerticalStepper only; default: 3
		activationMode?: 'auto' | 'manual'; // HorizontalStepper only; default: 'manual'
		formatStepLabel?: ( step: number, total: number, status?: 'completed' | 'error' ) => string;
		children: ReactNode;
		className?: string;
		ref?: Ref< StepperRef >;
	},
	'aria-label' | 'aria-labelledby'
>;
```

### `VerticalStepper.Step` / `HorizontalStepper.Step`

```ts
type StepProps = {
	value: string;
	title: string;
	description?: string;
	status?: 'completed' | 'error';
	optional?: boolean;
	disabled?: boolean;
	indicator?: ReactNode; // custom indicator content; built-in accessible text still generated
	forceMount?: boolean; // horizontal only: keep panel mounted when inactive
	children: ReactNode; // panel content
	className?: string;
};
```

### Imperative handle

```ts
type StepperRef = {
	focusStep: ( value: string ) => void;
};
```

### Tier 2 (`Stepper.*`) props

`Stepper.Root` adds `orientation: 'vertical' | 'horizontal'` and is otherwise identical to `StepperProps`. All other Tier 2 components extend `ComponentProps<'div'>` or `ComponentProps<'button'>` where applicable. All components use `forwardRef`.

---

## State Model

### Step state

```ts
// Consumer-provided
status?: 'completed' | 'error'   // mutually exclusive by type; undefined = not evaluated
optional?: boolean
disabled?: boolean

// Derived by Root
isCurrent: boolean    // value === root's active value
// "upcoming" = not current, no status, appears after current in registration order
```

The hybrid model (not a single enum) allows combinations a flat enum cannot express — e.g., a disabled but completed step, or an optional but errored step.

### Context

```ts
// Registration record for each step (populated by useStepRegistration)
type StepMeta = {
	value: string;
	status?: 'completed' | 'error';
	disabled: boolean;
};

// Root context — available to all descendants
type StepperContext = {
	value: string;
	onValueChange: ( value: string ) => void;
	orientation: 'vertical' | 'horizontal';
	linear: boolean;
	headingLevel: 2 | 3 | 4 | 5 | 6; // vertical only; default: 3
	activationMode: 'auto' | 'manual'; // horizontal only; default: 'manual'
	steps: StepMeta[];
	totalSteps: number;
	formatStepLabel: ( step: number, total: number, status?: 'completed' | 'error' ) => string;
};

// Per-step context — provided by Stepper.Step to its children
type StepContext = {
	value: string;
	index: number; // 0-based, from registration order
	totalSteps: number;
	isCurrent: boolean;
	status?: 'completed' | 'error';
	isDisabled: boolean; // explicit disabled OR derived from linear flow
	optional: boolean;
};
```

### Step registration

Steps register via `useStepRegistration` on mount and deregister on unmount. Registration order is the sole source of truth for index, counting, and linear flow. No `sortOrder` prop.

### Controlled / uncontrolled

Follows the `value` / `defaultValue` / `onValueChange` pattern. Programmatic `value` changes (consumer-controlled) bypass linear constraints.

### Linear flow

When `linear={true}`, a trigger is `aria-disabled` unless it is the current step or has `status="completed"`. Explicit `disabled` prop always takes priority over linear logic.

| Scenario                                       | Result                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `linear` + completed + not explicitly disabled | Navigable                                                                  |
| `linear` + completed + `disabled={true}`       | Not navigable                                                              |
| Non-linear + `disabled={true}`                 | Not navigable                                                              |
| Current step + `disabled={true}`               | Panel visible; trigger `aria-disabled`; consumer advances programmatically |

---

## Accessibility

### Vertical (accordion)

| Element | Rendered as           | ARIA                                                                |
| ------- | --------------------- | ------------------------------------------------------------------- |
| Root    | `<div>`               | `aria-label` or `aria-labelledby`                                   |
| Step    | `<div>`               | `data-status`, `data-disabled`, `data-current` for CSS hooks        |
| Trigger | `<hN><button>`        | `aria-expanded`, `aria-controls`, `aria-current="step"` when active |
| Panel   | `<div role="region">` | `aria-labelledby` — `role="region"` omitted when `totalSteps > 5`   |

### Horizontal (tabs)

| Element | Rendered as             | ARIA                                                                                   |
| ------- | ----------------------- | -------------------------------------------------------------------------------------- |
| List    | `<div role="tablist">`  |                                                                                        |
| Trigger | `<button role="tab">`   | `aria-selected`, `aria-controls`, `aria-current="step"`, `tabindex="-1"` when inactive |
| Panel   | `<div role="tabpanel">` | `aria-labelledby`                                                                      |

`aria-disabled="true"` (not HTML `disabled`) on all non-activatable triggers. Keeps them focusable and discoverable by keyboard users.

### Keyboard — vertical

| Key                     | Behavior                                |
| ----------------------- | --------------------------------------- |
| `ArrowDown` / `ArrowUp` | Move focus between triggers             |
| `Home` / `End`          | First / last trigger                    |
| `Enter` / `Space`       | Activate focused trigger                |
| `Tab`                   | Move between triggers and panel content |

### Keyboard — horizontal

| Key                        | Behavior                                          |
| -------------------------- | ------------------------------------------------- |
| `ArrowRight` / `ArrowLeft` | Move focus between triggers (reversed in RTL)     |
| `Home` / `End`             | First / last trigger                              |
| `Enter` / `Space`          | Activate when `activationMode="manual"` (default) |
| `Tab`                      | Active tab → active panel → out                   |

RTL direction read from nearest ancestor `dir` attribute. No explicit prop needed.

### Focus management

| Transition                         | Behavior                                                               |
| ---------------------------------- | ---------------------------------------------------------------------- |
| User activates trigger             | Focus stays on trigger                                                 |
| Programmatic `value` change        | Focus does not move; consumer calls `stepperRef.focusStep()`           |
| Active panel unmounts (horizontal) | Focus moves to new panel's first focusable element, or panel container |

### `formatStepLabel`

Default implementation:

```ts
function defaultFormatStepLabel( step: number, total: number, status?: 'completed' | 'error' ) {
	let label = `Step ${ step } of ${ total }`;
	if ( status === 'completed' ) label += ', completed';
	if ( status === 'error' ) label += ', error';
	return label;
}
```

Consumers override for localization. Custom `indicator` content is `aria-hidden="true"`; the built-in label is always generated.

---

## Visual Design

### Indicators — default rendering by state

| State     | Visual                     | Accessible text          |
| --------- | -------------------------- | ------------------------ |
| Upcoming  | Step number, dashed circle | "Step N of M"            |
| Current   | Step number, filled circle | "Step N of M"            |
| Completed | Check icon                 | "Step N of M, completed" |
| Error     | Warning icon               | "Step N of M, error"     |

### Connectors

Rendered via CSS `::after` pseudo-elements on `Step`. Purely decorative. Color changes based on `data-status` attribute.

```scss
// Vertical connector
.step:not( :last-child )::after {
	content: '';
	position: absolute;
	left: var( --stepper-indicator-center );
	top: var( --stepper-trigger-height );
	bottom: 0;
	width: 1px;
	background: var( --wpds-color-stroke-subtle );
}

.step[data-status='completed']::after {
	background: var( --wpds-color-stroke-success );
}
.step[data-status='error']::after {
	background: var( --wpds-color-stroke-error );
}

// Horizontal connector
.step:not( :last-child )::after {
	content: '';
	position: absolute;
	top: var( --stepper-indicator-center );
	left: calc( 50% + var( --stepper-indicator-radius ) + var( --stepper-connector-gap ) );
	right: calc( -50% + var( --stepper-indicator-radius ) + var( --stepper-connector-gap ) );
	height: 1px;
	background: var( --wpds-color-stroke-subtle );
}
```

### Transitions

CSS-only. No animation props.

- Vertical panel: `grid-template-rows: 0fr → 1fr`
- Horizontal panel: `opacity` or no transition
- All transitions respect `@media (prefers-reduced-motion: reduce)`

### CSS conventions

- CSS Modules (`.module.scss`)
- `@use '@wordpress/base-styles/colors'`, `variables`, `mixins`
- Dark mode via `when-dark-theme` mixin from `calypso/assets/stylesheets/shared/mixins/dark-theme`
- Color tokens from `../utils/_theme-variables` — no hardcoded hex values
- `clsx` for class merging

---

## Dev-mode Warnings

| Situation                                     | Warning                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------ |
| Duplicate `value` props                       | "Two steps share value '{value}'. Each step must have a unique value."         |
| Root `value` matches no step                  | "No step found with value '{value}'. Falling back to the first step."          |
| `Stepper.List` in vertical mode               | "Stepper.List is only used in horizontal mode. It will be ignored."            |
| `Stepper.Panel` in horizontal without `value` | "Stepper.Panel requires a 'value' prop in horizontal mode."                    |
| `Stepper.Panel` `value` matches no step       | "No step found with value '{value}' for this Panel."                           |
| Missing `aria-label` and `aria-labelledby`    | "Stepper requires either 'aria-label' or 'aria-labelledby' for accessibility." |

---

## Out of Scope (v1)

| Idea                                    | Rationale                                                               |
| --------------------------------------- | ----------------------------------------------------------------------- |
| Progress-only / non-interactive stepper | Different ARIA pattern; add later as separate component                 |
| `Stepper.Connector` component           | CSS pseudo-elements are sufficient for v1                               |
| `Stepper.Actions` (Next/Back/Finish)    | A stack with buttons is sufficient                                      |
| Navigation stepper (links / `href`)     | Better served by a breadcrumb or progress nav component                 |
| Responsive orientation switching        | Consumer conditionally renders `VerticalStepper` or `HorizontalStepper` |
| `sortOrder` prop on steps               | Registration order is sole source of truth                              |
| Animation props                         | CSS-only transitions; `prefers-reduced-motion` handles opt-out          |
| `role="region"` opt-out prop            | Auto-omitted when `totalSteps > 5`                                      |
