## Next

### Breaking changes

- Remove unused corporate logos for CNN, Salesforce, and Slack ([#99367](https://github.com/Automattic/wp-calypso/pull/99367)).
- Remove unused corporate logos for Bloomberg, Conde Nast, Disney, Facebook, and Time ([#99229](https://github.com/Automattic/wp-calypso/pull/99229)).
- Remove `GMClosureNotice` ([#99309](https://github.com/Automattic/wp-calypso/pull/99309)).
- Remove `ClientLogoList` ([#99463](https://github.com/Automattic/wp-calypso/pull/99463)).
- Remove `number-formatters` component and utility functions ([#99405](https://github.com/Automattic/wp-calypso/pull/99405))
- Remove `PostStatsCard` ([#99665](https://github.com/Automattic/wp-calypso/pull/99665)).
- Remove `PricingSlider` ([#102362](https://github.com/Automattic/wp-calypso/pull/102362)).

### Enhancements

- Add FlowQuestion component

## 2.1.1

- Fix import path in post-stats-card/index.tsx and fix can't resolve "assets" error #90267.

## 2.1.0

- Update social-logos to ^2.5.2 (#72876)
- Remove the `HappinessEngineersTray` component and the dependencies on `@automattic/data-stores`, `@automattic/search` and `wpcom-proxy-request`

## 2.0.1

- Add missing dependencies: `@automattic/typography` and `wpcom-proxy-request`

## 2.0.0

- Add WordPressLogo component (#64110)
- Add Spinner component (#63657)
- Add FormInputValidation component (#63760)
- Remove module-boundary types from React components (#63817)
- Add 'starter-plan' to product icon config (#63617)
- Add `shuffled` prop to `HappinessEngineersTray` to toggle shuffle feature (#63344)
- Add Gravatar and HappinessEngineersTray components (#63198)
- Add 'pro-plan' to product icon config (#61934)
- Add pagination control component (#60327)
- Detect swipe gestures in DotPager to hide popovers in containing Tasks components (#60941)
- Added AdditionalOverlayClassNames prop to Dialog component to allow customizing the modal window. (#60017)
- Docs: Remove unnecessary React import from READMEs (#58353)
- Chore: Add missing dependencies - @wordpress/base-styles (#58271)
- CompactCard: forward ref to the child component (#57893)
- Add slugs for new real-time Backup and Security plans to the product-icon map(#57563)
- Add Jetpack VideoPress Product icon and configs (#56103)
- Move Gridicon to @automattic/components (#56056)
- Update a8c deps (#55907)
  - Update @automattic/react-virtualized to ^9.22.3
  - Update gridicons to ^3.4.0
  - Update social-logos to ^2.4.0
- Move Popover to @automattic/components (#55238)
- Update dependency classnames to ^2.3.1 (#54370)
- Themes Thanks Modal: render link buttons as anchor elements (#53577)
- Remove sass tilde imports (#52800)
- Update all style packages to the latest version (#52801)
- Fix optional prop types for Dialog and ButtonBar (#51839)
- Fix borders of disabled scary buttons (#51853)
- Fix Card children key warning (#51319)
- Turn Card into function component and forward refs (#50924)
- Refactor Card to TypeScript (#50863)
- Buttons: Ensure pointer-events are disabled for busy buttons (#50906)
- Migrate Dialog to TypeScript (#50093)
- Refactor away from \_.noop() - take 2 (#50755)
- Refactor logic that turns Nav Unification on (#50711)
- Convert Suggestions to TypeScript (#50135)
- Convert ProductIcon to TypeScript (#49837)
- Refactor RootChild into function component with TypeScript (#50010)
- Convert Ribbon to TypeScript (#50009)
- Convert Button to Typescript (#49833)
- Update Our Color Palette to the Most Recent Version (#49489)
- Add jetpack_scan_realtime and jetpack_scan_realtime_monthly to jetpack-scan in product-icon config. (#49044)
- Add nav-unifcation class to dialog\_\_backdrop so that masterbar-height used is the correct. (#48873)
- Update font weights and sizes on buttons to better match Gutenberg (#47164)
- Update product-icon for wpcom-premium (#46466)
- Update product-icon config for Jetpack CRO (#46608)
- Add and import darker blue single product icons. (#46360)
- Use FormTextInput for all type="text" inputs (#45746)

### Breaking changes

- Update to React 17 and latest WordPress packages (#54793)

## 1.0.0-alpha.4

- Add `Popover`
- Add `Gridicon`

## 1.0.0-alpha.3

- Add `plain` prop to `Button`

## 1.0.0-alpha.2

- Added missing dependency on `@babel/runtime`

## 1.0.0-alpha.1

- Add ProductIcon
- Fixed SCSS errors due to missing variables and mixins

## 1.0.0-alpha.0

- Rename package from `@automattic/calypso-ui` to `@automattic/components`, keep version at 1.0.0
- Add Button
- Add Card
- Add Dialog
- Add Ribbon
- Add RootChild
- Add Suggestions

## 1.0.0

- Add ProgressBar
- Add ScreenReaderText
