# Stepper Component — Requirements

**Date:** 2026-05-25
**Package:** `@automattic/ui` (`packages/ui/`)
**Status:** Ready for planning

---

## Summary

A reusable `Stepper` component that communicates progress through a sequence of steps and supports navigation between them. Two orientations are supported: horizontal (tabs pattern) and vertical (accordion pattern). Both ship in v1.

---

## Two-Tier API

### Tier 1 — High-level (recommended for most consumers)

Two composed components with identical JSX shape. The only difference is which component is imported:

- `VerticalStepper` + `VerticalStepper.Step`
- `HorizontalStepper` + `HorizontalStepper.Step`

Each `*.Step` accepts metadata props (`value`, `title`, `description`, `status`, `optional`, `disabled`, `indicator`) and panel content via `children`. The component handles DOM structure, ARIA attributes, heading wrappers, and keyboard behavior.

### Tier 2 — Low-level primitives (escape hatch)

Eight sub-components exported under the `Stepper` namespace for consumers who need full control:

`Stepper.Root`, `Stepper.List`, `Stepper.Step`, `Stepper.Trigger`, `Stepper.Panel`, `Stepper.Indicator`, `Stepper.Title`, `Stepper.Description`

---

## Props

### `VerticalStepper` / `HorizontalStepper`

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `aria-label` or `aria-labelledby` | `string` | — | One is required |
| `value` | `string` | — | Controlled active step |
| `defaultValue` | `string` | — | Uncontrolled initial step |
| `onValueChange` | `(value: string) => void` | — | |
| `linear` | `boolean` | `false` | Constrains navigation to current + completed steps |
| `headingLevel` | `2\|3\|4\|5\|6` | `3` | Vertical only; heading wrapping each trigger |
| `activationMode` | `'auto'\|'manual'` | `'manual'` | Horizontal only; whether focus immediately activates |
| `formatStepLabel` | `(step, total, status?) => string` | English default | For i18n of indicator accessible text |
| `className` | `string` | — | |
| `ref` | `Ref<StepperRef>` | — | Imperative focus handle |

### `*.Step`

| Prop | Type | Notes |
|------|------|-------|
| `value` | `string` | Required, unique |
| `title` | `string` | Required |
| `description` | `string` | Optional subtitle |
| `status` | `'completed'\|'error'` | Mutually exclusive validation states |
| `optional` | `boolean` | Step can be skipped |
| `disabled` | `boolean` | Step cannot be activated |
| `indicator` | `ReactNode` | Custom indicator content |
| `forceMount` | `boolean` | Keep panel mounted when inactive (horizontal) |
| `children` | `ReactNode` | Panel content |
| `className` | `string` | |

### Imperative handle

```ts
type StepperRef = {
  focusStep: (value: string) => void;
};
```

---

## State Model

`current` is derived (matches root `value`). `upcoming` is derived (no status, appears after current in registration order).

`status` uses an enum (`'completed' | 'error'`) because these are mutually exclusive. `optional` and `disabled` are separate booleans because they can combine with any status.

`disabled` always takes priority over `linear` constraints.

### Linear flow

When `linear={true}`, a step is navigable only if it is current or has `status="completed"`. Future steps get `aria-disabled="true"` (focusable, non-activatable). Programmatic `value` changes bypass linear constraints.

---

## Accessibility

### Vertical (accordion + headings)

- Trigger: `<hN><button aria-expanded aria-controls aria-current="step"></button></hN>`
- Panel: `<div role="region" aria-labelledby>` when `totalSteps <= 5`; plain `<div>` when `totalSteps > 5` to avoid landmark noise

### Horizontal (tabs)

- List: `<div role="tablist">`
- Trigger: `<button role="tab" aria-selected aria-controls aria-current="step">`
- Panel: `<div role="tabpanel" aria-labelledby>`

### Why `<div>` containers, not `<ol>/<li>`

The Indicator's visually-hidden "Step N of M" text already provides richer positional context (including status). Using `<ol>/<li>` would create redundant announcements ("item 1 of 3" + "Step 1 of 3"). `<div>` containers match APG accordion and tabs examples.

### Disabled triggers

Use `aria-disabled="true"` (not HTML `disabled`) so the trigger remains focusable. Keyboard users can arrow to it and hear its label and state.

---

## Keyboard Interaction

### Vertical

| Key | Behavior |
|-----|----------|
| `ArrowDown` | Next trigger |
| `ArrowUp` | Previous trigger |
| `Home` | First trigger |
| `End` | Last trigger |
| `Enter` / `Space` | Activate (expand/collapse) |
| `Tab` | Move focus into/out of stepper and between triggers and panel content |

### Horizontal

| Key | Behavior |
|-----|----------|
| `ArrowRight` / `ArrowLeft` | Next / previous trigger (reversed in RTL) |
| `Home` | First trigger |
| `End` | Last trigger |
| `Enter` / `Space` | Activate when `activationMode="manual"` |
| `Tab` | Move focus to active tab, then into active panel |

When `activationMode="auto"`, arrow key focus immediately activates.

---

## Focus Management

| Transition | Focus behavior |
|------------|---------------|
| User activates trigger | Focus stays on trigger |
| Programmatic `value` change | Focus does not move; consumer uses `StepperRef.focusStep()` |
| Active panel unmounts (horizontal) | If focus was inside, moves to newly active panel's first focusable element or panel container |

---

## Visual Design

### Indicators

| State | Visual | Accessible label |
|-------|--------|-----------------|
| Upcoming | Number in dashed circle | "Step N of M" |
| Current | Number in filled circle (emphasized) | "Step N of M" |
| Completed | Check icon | "Step N of M, completed" |
| Error | Warning icon | "Step N of M, error" |

Custom indicator content is accepted via `indicator` prop (Tier 1) or `children` (Tier 2). When provided, the built-in visually-hidden label is still generated; custom content is `aria-hidden="true"`.

### Connectors

Purely decorative lines between steps. Rendered via CSS `::after` pseudo-elements on the step container. Not a separate component. Color reflects prior step's status (default stroke, success green for completed, error red for error step).

### Responsive behavior

On mobile, step labels (title/description) are hidden via a CSS breakpoint. Indicators remain visible. This is always-on CSS behavior with no prop. The breakpoint is determined during implementation to match the design system's existing breakpoints.

### Transitions

- Vertical panel expand/collapse: CSS transition on `grid-template-rows: 0fr -> 1fr`
- Horizontal panel switch: CSS transition on `opacity` and/or `transform`
- All transitions respect `@media (prefers-reduced-motion: reduce)`

---

## Internationalization

The `formatStepLabel` callback generates the Indicator's visually-hidden text. Default implementation (English):

```ts
function defaultFormatStepLabel(step, total, status) {
  let label = `Step ${step} of ${total}`;
  if (status === 'completed') label += ', completed';
  if (status === 'error') label += ', error';
  return label;
}
```

RTL: horizontal arrow key directions and connector layout automatically follow the nearest `dir` attribute. No explicit `direction` prop needed.

---

## Implementation Strategy

### Primitive dependency

Add `@ariakit/react` as an explicit dependency to `@automattic/ui`. Ariakit is already present in the monorepo as a transitive dep of `@wordpress/components`.

| Orientation | Ariakit primitive |
|-------------|------------------|
| Vertical | `disclosure` (Disclosure.Root, Disclosure.Trigger, Disclosure.Content) |
| Horizontal | `tab` (Tab.Provider, Tab.List, Tab, Tab.Panel) |

### Tier 1 internals

`VerticalStepper` and `HorizontalStepper` are implemented using the Tier 2 primitives. Each `*.Step` registers its metadata with root via context on mount (not `React.Children` iteration, to support conditional/dynamic steps). Registration order determines step index.

### Dev-mode warnings

| Situation | Warning |
|-----------|---------|
| Duplicate `value` across steps | "Two steps share value '{value}'. Each step must have a unique value." |
| Root `value` matches no step | "No step found with value '{value}'. Falling back to the first step." |
| `Stepper.List` used in vertical mode | "Stepper.List is only used in horizontal mode. It will be ignored." |
| `Stepper.Panel` in horizontal without `value` | "Stepper.Panel requires a 'value' prop in horizontal mode." |
| Missing `aria-label` and `aria-labelledby` | "Stepper requires either 'aria-label' or 'aria-labelledby' for accessibility." |

---

## File Structure

```
packages/ui/src/
├── vertical-stepper/
│   ├── index.ts
│   ├── vertical-stepper.tsx
│   ├── vertical-stepper-step.tsx
│   ├── style.module.scss
│   ├── stories/
│   │   └── index.story.tsx
│   └── test/
│       └── index.test.tsx
├── horizontal-stepper/
│   ├── index.ts
│   ├── horizontal-stepper.tsx
│   ├── horizontal-stepper-step.tsx
│   ├── style.module.scss
│   ├── stories/
│   │   └── index.story.tsx
│   └── test/
│       └── index.test.tsx
└── stepper/
    ├── index.ts
    ├── types.ts
    ├── context.tsx
    ├── root.tsx
    ├── list.tsx
    ├── step.tsx
    ├── trigger.tsx
    ├── panel.tsx
    ├── indicator.tsx
    ├── title.tsx
    ├── description.tsx
    ├── style.module.scss
    ├── stories/
    │   └── index.story.tsx
    └── test/
        └── index.test.tsx
```

### Styling conventions

- CSS Modules with `.module.scss` (matching existing package convention)
- Use `--wp-components-*` custom properties and `_theme-variables.scss` for colors (not `--wpds-*`)
- Use `when-dark-theme` mixin for dark mode per `packages/ui/AGENTS.md`
- Use `clsx` for class merging
- `forwardRef` on all components
- `ComponentProps` for type extension

---

## Out of Scope (v1)

| Idea | Rationale |
|------|-----------|
| Progress-only / non-interactive stepper | Different ARIA pattern; separate component |
| `Stepper.Connector` component | CSS pseudo-elements are sufficient |
| `Stepper.Actions` (Next/Back/Finish) | A `Stack` with buttons is sufficient |
| Navigation stepper with links | Better served by a breadcrumb/progress nav component |
| Responsive orientation switching | Consumer conditionally renders `VerticalStepper` or `HorizontalStepper` |
| `animated` prop | CSS-only transitions are sufficient |
| `sortOrder` prop | Registration order is the source of truth |
