# @automattic/site-launch-modals

Presentational modals for the WordPress.com site-launch flow:

- **Pre-launch modal** — a confirmation shown before a site is made public.
- **Celebration modal** — a post-launch celebration with a domain upsell.

Both components are purely presentational: props in, callbacks out. They import
only `react`, `@wordpress/*`, and `canvas-confetti`. They do **not** fetch data,
read routing/analytics, or depend on any Calypso code, so they are portable to any
React runtime that ships `@wordpress/*` (including `wp-admin`). Each consumer wires
its own data, URLs, and analytics through props.

## Installation

```
yarn add @automattic/site-launch-modals
```

Peer dependencies: `react` and `react-dom` (`^18.3.1 || ^19.0.0`).

## Usage

Import each modal from its own subpath so a consumer only bundles the one it uses:

```tsx
import CelebrationModal from '@automattic/site-launch-modals/celebration-modal';
import PreLaunchModal from '@automattic/site-launch-modals/pre-launch-modal';
```

A consumer that uses both modals can import them from the package root barrel
instead, along with their prop types:

```tsx
import {
	PreLaunchModal,
	CelebrationModal,
	type PreLaunchModalProps,
} from '@automattic/site-launch-modals';
```

Prefer the granular subpaths when a consumer only needs one modal, so it doesn't
bundle the other.

## `PreLaunchModal`

Renders the launch confirmation. While `isLaunching` is true it swaps the
confirmation for a spinner and updates the title.

| Prop          | Type                   | Description                                                         |
| ------------- | ---------------------- | ------------------------------------------------------------------- |
| `siteName`    | `string`               | The site's display name.                                            |
| `siteDomain`  | `string`               | The domain (or slug) shown next to the globe icon.                  |
| `planName`    | `string`               | The plan's display name shown next to the payment icon.             |
| `isLaunching` | `boolean`              | When true, shows the launching spinner instead of the confirmation. |
| `preview`     | `ReactNode` (optional) | A node rendered inside the preview card (e.g. a site thumbnail).    |
| `onLaunch`    | `() => void`           | Called when the user confirms the launch.                           |
| `onClose`     | `() => void`           | Called when the modal requests to close.                            |

The consumer owns the `preview` node and its styling (the package does not ship a
site preview). Use the class `site-launch-pre-launch-modal__thumbnail` if you want
to reuse the existing thumbnail layout.

## `CelebrationModal`

Renders the post-launch celebration, fires confetti on mount, and conditionally
shows a domain upsell based on the plan/domain flags.

| Prop              | Type                | Description                                                                     |
| ----------------- | ------------------- | ------------------------------------------------------------------------------- |
| `siteDomain`      | `string`            | The domain (or slug) shown and copied to the clipboard.                         |
| `siteUrl`         | `string` (optional) | Target of the "View site" action. Renders a button (not a link) when omitted.   |
| `hasCustomDomain` | `boolean`           | Whether the site already has a custom domain. Hides the upsell when true.       |
| `isPaidPlan`      | `boolean`           | Whether the site is on a paid plan. Drives the upsell copy.                     |
| `isBilledMonthly` | `boolean`           | Whether the paid plan is billed monthly. Drives the annual-billing upsell copy. |
| `upsellHref`      | `string`            | Href for the upsell button.                                                     |
| `onUpsellClick`   | `() => void`        | Called when the upsell button is clicked (wire your own analytics here).        |
| `onClose`         | `() => void`        | Called when the modal requests to close.                                        |

### Values the consumer must compute

These are supplied by the wp-calypso data layer today; a new consumer must derive
them from its own data:

- `planName` (pre-launch) — the plan's display name.
- `siteDomain` / `hasCustomDomain` — from the site's domains (a "custom domain" is a
  domain with an active subscription; wp-calypso falls back to the site slug).
- `isPaidPlan` / `isBilledMonthly` (celebration) — from the site's plan.
- `upsellHref` (celebration) — the add-a-domain URL for the site.
- `preview` (pre-launch) — the thumbnail/preview node, if any.

## Styles

Each component imports its own light-mode stylesheet. Colors use CSS custom
properties (e.g. `--studio-blue-5`); define these in the host app if they are not
already present. Dark-mode overrides are the consumer's responsibility.
