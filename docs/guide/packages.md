# Calypso Packages

This document provides an overview of the various packages within the Calypso monorepo, categorized by their status and recommendation level. We're currently auditing all the packages to make sure that they adhere to the [package guidelines](../monorepo.md#package-guidelines).

## Recommended Packages

These packages are well-maintained, documented, and recommended for use in both Calypso and external projects:

- [**@automattic/components**](../../packages/components/README.md): Reusable React components for building user interfaces
- [**@automattic/grid**](../../packages/grid/README.md): Grid layout components
- [**@automattic/dataviews**](../../packages/dataviews/README.md): Render data-based UI (lists and forms).
- [**@automattic/calypso-color-schemes**](../../packages/calypso-color-schemes/README.md): Color schemes for Calypso. This should ideally be deprecated but it is now a strict dependency of `@automattic/components`.

## WP.com Packages

These packages are well-maintained, documented and recommended for use both in Calypso and external projects, but they have a dependency towards WP.com REST API.

- [**@automattic/wpcom-proxy-request**](../../packages/wpcom-proxy-request/README.md): Proxied cookie-authenticated requests to WordPress.com

## Internal Packages

These packages are well-maintained, documented, but mostly recommended for usage within Calypso.

- [**@automattic/calypso-build**](../../packages/calypso-build/README.md): Build tools and webpack configurations for Calypso

## Unaudited Packages

These packages are generally working but may need additional testing, documentation, or code review before being recommended:

- [**@automattic/format-currency**](../../packages/format-currency/README.md): International currency formatting library
- [**@automattic/i18n-utils**](../../packages/i18n-utils/README.md): Additional i18n helper functions
- [**@automattic/js-utils**](../../packages/js-utils/README.md): Collection of reusable JavaScript utilities
- [**@automattic/calypso-config**](../../packages/calypso-config/README.md): Configuration management utilities
- [**@automattic/languages**](../../packages/languages/README.md): Data about languages WordPress supports
- [**@automattic/viewport**](../../packages/viewport/README.md): Utilities for responsive design and viewport detection
- [**@automattic/calypso-router**](../../packages/calypso-router/README.md): Client-side routing library
- [**@automattic/typography**](../../packages/typography/README.md): Typography components and styles
- [**@automattic/load-script**](../../packages/load-script/README.md): Utility for loading external scripts
- [**@automattic/calypso-polyfills**](../../packages/calypso-polyfills/README.md): Browser polyfills for better compatibility
- [**@automattic/generate-password**](../../packages/generate-password/README.md): Password generation utility
- [**@automattic/state-utils**](../../packages/state-utils/README.md): Utilities for Redux state management
- [**@automattic/wpcom.js**](../../packages/wpcom.js/README.md): JavaScript client for the WordPress.com REST API
- [**@automattic/wpcom-xhr-request**](../../packages/wpcom-xhr-request/README.md): XHR request to the WordPress.com REST API
- [**@automattic/babel-plugin-i18n-calypso**](../../packages/babel-plugin-i18n-calypso/README.md): Babel plugin for i18n preprocessing
- [**@automattic/babel-plugin-preserve-i18n**](../../packages/babel-plugin-preserve-i18n/README.md): Preserves i18n blocks during transformation
- [**@automattic/calypso-analytics**](../../packages/calypso-analytics/README.md): Analytics tracking utilities
- [**@automattic/calypso-eslint-overrides**](../../packages/calypso-eslint-overrides/README.md): ESLint overrides for Calypso
- [**@automattic/calypso-jest**](../../packages/calypso-jest/README.md): Jest configuration for Calypso
- [**@automattic/calypso-stripe**](../../packages/calypso-stripe/README.md): Stripe payment integration
- [**@automattic/calypso-typescript-config**](../../packages/calypso-typescript-config/README.md): TypeScript configuration for Calypso
- [**@automattic/calypso-url**](../../packages/calypso-url/README.md): URL utilities
- [**@automattic/command-palette**](../../packages/command-palette/README.md): Command palette interface
- [**@automattic/composite-checkout**](../../packages/composite-checkout/README.md): Checkout components
- [**@automattic/data-stores**](../../packages/data-stores/README.md): Data management utilities
- [**@automattic/eslint-plugin-wpcalypso**](../../packages/eslint-plugin-wpcalypso/README.md): ESLint rules for Calypso
- [**@automattic/explat-client**](../../packages/explat-client/README.md): Experimentation client
- [**@automattic/i18n-calypso-cli**](../../packages/i18n-calypso-cli/README.md): CLI for i18n extraction
- [**@automattic/interpolate-components**](../../packages/interpolate-components/README.md): Component interpolation
- [**@automattic/language-picker**](../../packages/language-picker/README.md): Language selection UI
- [**@automattic/photon**](../../packages/photon/README.md): WordPress.com Photon image service client
- [**@automattic/popup-monitor**](../../packages/popup-monitor/README.md): Popup window manager
- [**@automattic/search**](../../packages/search/README.md): Search components
- [**@automattic/social-previews**](../../packages/social-previews/README.md): Social media previews
- [**@automattic/tree-select**](../../packages/tree-select/README.md): Tree selection utilities
- [**@automattic/viewport-react**](../../packages/viewport-react/README.md): React viewport components
- [**@automattic/whats-new**](../../packages/whats-new/README.md): "What's new" feature components
- [**@automattic/wp-babel-makepot**](../../packages/wp-babel-makepot/README.md): Babel plugin for POT generation
- [**@automattic/calypso-babel-config**](../../packages/calypso-babel-config/README.md): Babel configuration for Calypso
- [**@automattic/calypso-doctor**](../../packages/calypso-doctor/README.md): Diagnostic tool for Calypso
- [**@automattic/zendesk-client**](../../packages/zendesk-client/README.md): Zendesk API client
- [**@automattic/calypso-products**](../../packages/calypso-products/README.md): WordPress.com product definitions and utilities
- [**@automattic/domain-picker**](../../packages/domain-picker/README.md): Domain selection UI for WordPress.com
- [**@automattic/domains-table**](../../packages/domains-table/README.md): Domains table component
- [**@automattic/help-center**](../../packages/help-center/README.md): Help center components for WordPress.com
- [**@automattic/jetpack-ai-calypso**](../../packages/jetpack-ai-calypso/README.md): Jetpack AI integration for Calypso
- [**@automattic/launchpad**](../../packages/launchpad/README.md): Site launch tools for WordPress.com
- [**@automattic/launchpad-navigator**](../../packages/launchpad-navigator/README.md): Navigator for WordPress.com launch flow
- [**@automattic/oauth-token**](../../packages/oauth-token/README.md): OAuth token management for WordPress.com
- [**@automattic/odie-client**](../../packages/odie-client/README.md): Client for WordPress.com's Odie service
- [**@automattic/onboarding**](../../packages/onboarding/README.md): User onboarding flows for WordPress.com
- [**@automattic/plans-grid**](../../packages/plans-grid/README.md): WordPress.com plans grid
- [**@automattic/plans-grid-next**](../../packages/plans-grid-next/README.md): Next-generation WordPress.com plans grid
- [**@automattic/shopping-cart**](../../packages/shopping-cart/README.md): WordPress.com shopping cart
- [**@automattic/site-admin**](../../packages/site-admin/README.md): WordPress.com site administration utilities
- [**@automattic/wpcom-checkout**](../../packages/wpcom-checkout/README.md): WordPress.com checkout flows
- [**@automattic/wpcom-template-parts**](../../packages/wpcom-template-parts/README.md): WordPress.com template components
- [**@automattic/calypso-apps-builder**](../../packages/calypso-apps-builder/README.md): Use newer build tools instead
- [**@automattic/calypso-codemods**](../../packages/calypso-codemods/README.md): For legacy code transformations
- [**@automattic/calypso-e2e**](../../packages/calypso-e2e/README.md): Use Playwright or other modern testing tools instead
- [**@automattic/calypso-mp-data-analysis**](../../packages/calypso-mp-data-analysis/README.md): For legacy analytics systems

## Deprecated Packages

These packages are no longer recommended for new projects:

- [**@automattic/accessible-focus**](../../packages/accessible-focus/README.md): Superseded by :focus-visible.
- [**@automattic/i18n-calypso**](../../packages/i18n-calypso/README.md): Internationalization utilities for Calypso, Superseded by @wordpress/react-i18n.

## Contributing to Packages

See the [Monorepo documentation](../monorepo.md) for information about adding or modifying packages.
