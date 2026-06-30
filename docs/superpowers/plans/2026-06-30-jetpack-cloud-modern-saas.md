# Jetpack Cloud Modern SaaS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize authenticated Jetpack Cloud pages with a cohesive SaaS-style visual system while keeping current colors and behavior intact.

**Architecture:** Add a shared authenticated visual layer through Jetpack Cloud layout/sidebar styles and targeted route-wrapper polish. Reuse existing layout components and Partner Portal layout primitives rather than rewriting inherited Calypso internals.

**Tech Stack:** React, TypeScript/JavaScript, SCSS, Calypso layout primitives, `@automattic/components`, WordPress Studio design tokens.

---

## File Structure

- Modify `client/jetpack-cloud/style.scss`: shared Jetpack Cloud authenticated design tokens and global scoped component polish.
- Modify `client/jetpack-cloud/components/layout/header.tsx`: allow reusable top bar usage through existing layout header primitives if actions are present.
- Modify `client/jetpack-cloud/components/layout/style.scss`: align top bar, body gutters, headers, bordered body surfaces, and responsive action wrapping.
- Modify `client/jetpack-cloud/components/sidebar/style.scss`: polish sidebar header, menu items, footer, active state, and site selector.
- Modify `client/jetpack-cloud/sections/partner-portal/layout/style.scss`: mirror the authenticated layout system for Partner Portal pages.
- Modify `client/jetpack-cloud/sections/agency-dashboard/header/style.scss`: reduce public-style hero feel on authenticated dashboard pages.
- Modify `client/jetpack-cloud/sections/agency-dashboard/sites-overview/style.scss`: align Sites page title/actions, tabs, filters, content, status pills, and mobile action bar.
- Modify `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/style.scss`: polish table container, header, rows, and borders.
- Modify `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-card/style.scss`: polish mobile cards and expanded content.
- Modify `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-search-filter-container/style.scss`: polish search/filter strip.
- Modify `client/jetpack-cloud/sections/overview/primary/overview/style.scss`: align overview cards and spacing.
- Modify `client/jetpack-cloud/sections/plugin-management/plugins-overview/style.scss`: align plugins wrapper spacing/title treatment.
- Modify `client/jetpack-cloud/sections/settings/style.scss`: align settings surfaces with the shared panel system.
- Modify selected Partner Portal SCSS files only where needed for shared card/form/list polish.

## Tasks

### Task 1: Add Shared Authenticated Design Tokens

**Files:**
- Modify: `client/jetpack-cloud/style.scss`

- [ ] **Step 1: Add scoped CSS custom properties**

Add authenticated Jetpack Cloud design tokens under `.theme-jetpack-cloud, .color-scheme.is-jetpack-cloud`:

```scss
--jetpack-cloud-app-background: #f6f7f7;
--jetpack-cloud-panel-background: var(--studio-white);
--jetpack-cloud-border-color: var(--studio-gray-5);
--jetpack-cloud-border-subtle-color: rgba(220, 220, 222, 0.65);
--jetpack-cloud-text-color: var(--studio-gray-100);
--jetpack-cloud-muted-text-color: var(--studio-gray-60);
--jetpack-cloud-radius: 6px;
--jetpack-cloud-radius-small: 4px;
--jetpack-cloud-control-height: 36px;
--jetpack-cloud-page-gutter: 48px;
--jetpack-cloud-page-gutter-small: 16px;
--jetpack-cloud-surface-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
```

- [ ] **Step 2: Run a syntax check**

Run: `yarn lint:css client/jetpack-cloud/style.scss`

Expected: exits 0 or reports only pre-existing tooling limitations. Fix new syntax errors before continuing.

### Task 2: Polish Shared Layout And Top Bar

**Files:**
- Modify: `client/jetpack-cloud/components/layout/style.scss`
- Inspect: `client/jetpack-cloud/components/layout/header.tsx`

- [ ] **Step 1: Update layout spacing and top bar styles**

Adjust `.jetpack-cloud-layout__top-wrapper`, `.jetpack-cloud-layout__body-wrapper`, `.jetpack-cloud-layout__header`, `.jetpack-cloud-layout__header-title`, `.jetpack-cloud-layout__header-subtitle`, and `.jetpack-cloud-layout__header-actions` to implement the approved top bar pattern:

```scss
.jetpack-cloud-layout__top-wrapper,
.jetpack-cloud-layout__body-wrapper {
	margin-inline: var(--jetpack-cloud-page-gutter-small);
}

.jetpack-cloud-layout__header {
	min-height: 64px;
	padding-block: 12px;
	gap: 16px;
}

.jetpack-cloud-layout__header-actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 8px;
	margin-inline-start: auto;
}
```

- [ ] **Step 2: Verify no markup change is required**

Inspect `header.tsx`. If existing `LayoutHeaderTitle`, `LayoutHeaderSubtitle`, and `LayoutHeaderActions` cover the API, do not change TypeScript.

- [ ] **Step 3: Run focused checks**

Run: `yarn lint:css client/jetpack-cloud/components/layout/style.scss`

Expected: exits 0 or reports only pre-existing tooling limitations. Fix new syntax errors before continuing.

### Task 3: Align Partner Portal Layout

**Files:**
- Modify: `client/jetpack-cloud/sections/partner-portal/layout/style.scss`

- [ ] **Step 1: Mirror shared top/body spacing**

Update `.partner-portal-layout__top-wrapper`, `.partner-portal-layout__body-wrapper`, `.partner-portal-layout__header`, and `.main.partner-portal-layout.is-with-border` to use the shared Jetpack Cloud variables.

- [ ] **Step 2: Preserve existing responsive behavior**

Keep the current mobile wrapping behavior and avoid changing layout component props.

- [ ] **Step 3: Run focused CSS check**

Run: `yarn lint:css client/jetpack-cloud/sections/partner-portal/layout/style.scss`

Expected: exits 0 or reports only pre-existing tooling limitations. Fix new syntax errors before continuing.

### Task 4: Polish Sidebar

**Files:**
- Modify: `client/jetpack-cloud/components/sidebar/style.scss`

- [ ] **Step 1: Update menu/header spacing**

Apply consistent sidebar item height, active background, icon color, hover state, header padding, footer spacing, and selected-site alignment. Keep existing class names and tracking behavior.

- [ ] **Step 2: Run focused CSS check**

Run: `yarn lint:css client/jetpack-cloud/components/sidebar/style.scss`

Expected: exits 0 or reports only pre-existing tooling limitations. Fix new syntax errors before continuing.

### Task 5: Polish Sites Dashboard Surfaces

**Files:**
- Modify: `client/jetpack-cloud/sections/agency-dashboard/header/style.scss`
- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/style.scss`
- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/style.scss`
- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-card/style.scss`
- Modify: `client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-search-filter-container/style.scss`

- [ ] **Step 1: Reduce authenticated hero treatment**

Make `agency-dashboard/header/style.scss` visually quieter for logged-in dashboard pages while preserving the existing header markup.

- [ ] **Step 2: Update Sites page top/title/action spacing**

Make `.sites-overview__page-title-container` match the shared top bar pattern and update action button spacing.

- [ ] **Step 3: Update search/filter/table/mobile card surfaces**

Apply shared radius, border, padding, and row rhythm to the search/filter strip, table, and mobile cards.

- [ ] **Step 4: Run focused CSS checks**

Run:

```bash
yarn lint:css client/jetpack-cloud/sections/agency-dashboard/header/style.scss
yarn lint:css client/jetpack-cloud/sections/agency-dashboard/sites-overview/style.scss
yarn lint:css client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-table/style.scss
yarn lint:css client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-card/style.scss
yarn lint:css client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-search-filter-container/style.scss
```

Expected: exits 0 or reports only pre-existing tooling limitations. Fix new syntax errors before continuing.

### Task 6: Polish Overview, Plugins, Settings, And Partner Portal Surfaces

**Files:**
- Modify: `client/jetpack-cloud/sections/overview/primary/overview/style.scss`
- Modify: `client/jetpack-cloud/sections/plugin-management/plugins-overview/style.scss`
- Modify: `client/jetpack-cloud/sections/settings/style.scss`
- Modify selected `client/jetpack-cloud/sections/partner-portal/**/style.scss` files when the page uses local card/form/list surfaces.

- [ ] **Step 1: Apply shared card/panel spacing**

Use shared variables for card margins, panel radius, border color, and page spacing.

- [ ] **Step 2: Apply form/list polish**

Normalize form sections and list cards in Partner Portal without changing markup or behavior.

- [ ] **Step 3: Run focused CSS checks**

Run lint checks for each touched SCSS file.

Expected: exits 0 or reports only pre-existing tooling limitations. Fix new syntax errors before continuing.

### Task 7: Visual And Type Verification

**Files:**
- No new files.

- [ ] **Step 1: Run focused tests for touched existing components**

Run tests that already exist near touched dashboard card/expanded-card surfaces:

```bash
yarn test-client client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-card/test/site-card.tsx
yarn test-client client/jetpack-cloud/sections/agency-dashboard/sites-overview/site-expanded-content/test/expanded-card.test.tsx
```

Expected: tests pass.

- [ ] **Step 2: Run client typecheck if feasible**

Run: `yarn typecheck-client`

Expected: exits 0. If it is too slow or fails for unrelated baseline issues, document the exact result in the PR.

- [ ] **Step 3: Start a local Jetpack Cloud route for visual inspection**

Run the existing app command if dependencies are available:

```bash
yarn start
```

Expected: local Calypso server starts on the configured `PORT` or `3000`.

- [ ] **Step 4: Inspect representative authenticated routes**

Use browser inspection or screenshots for:

- `/dashboard`
- `/overview`
- `/plugins`
- `/partner-portal/licenses`
- `/partner-portal/billing`
- `/partner-portal/payment-methods`
- `/partner-portal/invoices`
- `/settings`

Expected: top bar/title/action spacing is consistent, sidebar feels aligned, tables/cards/forms share the same visual language, and public pricing pages are not changed.
