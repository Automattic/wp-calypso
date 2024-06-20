# Changelog

## Unreleased

- New `useAllDomainsQuery` which fetches all the current user's domains

### Breaking changes

- Remove custom query and mutation hooks (based on `@tanstack/query`) from `support-queries/*`. These are moved to `@automattic/help-center`.
- Move the following query and mutation hooks (based on `@tanstack/query`) from `queries/*` to `@automattic/help-center`
  - `useIsWpOrgSite`
  - `useSiteAnalysis`
  - `useJetpackSearchAIQuery`
  - `useSubmitForumsMutation`
  - `useSupportStatus`
  - `useSupportActivity`
  - `useUpdateZendeskUserFieldsMutation`
  - `useUserSites`
  - `useWpcomSite`

## 3.0.1

- Add missing dependency @automattic/domain-utils, use-debounce

## 3.0.0

- Add dependency node-fetch and export `LinksForSection` & `getContextResults` (#64092)
- Fix the Static Design Picker shows immediately when changing the vertical (#64140)
- Add query params as query keys to useStarterDesignsGenerated() (#64108)
- Pass vertical_id to the generated designs endpoint to get vertical title (#64108)
- Add 'goals' state variable into onboard data-store (#64015)
- Pass siteSlug as the seed to the generated designs endpoint (#64029)
- Add help Center store (#63657)
- Add Happychat connection and dependency @automattic/happychat-connection (#63824)
- Change the endpoint used to fetch generated designs to starter-designs/generated endpoint (#63894)
- Remove module-boundary types from React components (#63817)
- Add `userDeclaredSiteUrl` to forum ticket (#63614)
- Add vertical_id to site setup api call (#63585)
- Reset Help Center store when support is done (#63582)
- Rename hasActiveSiteFeature selector (#63516)
- Update site data-store resolvers to use thunks (#63472)
- Add `useSiteIntent` and `useSibylQuery` (#63502)
- Add step progress info to onboard store (#63414)
- Persist `storeType` in onboard store (#63299)
- Add `useVerticalImagesQuery` (#63447)
- Update products-list resolver to use thunks instead of generators (#63426)
- Fix 3PC hook unmounting and document it better (#63415)
- Implement forums support user-declared sites analysis and messaging (#63407)
- Implement happy chat with and without 3rd party cookies (#63344)
- Add a hook to check for 3PC (#63378)
- Added persistance to stepper storeAddress step (#63334)
- Add support queries store (#63242)
- Added email field to onboard state (#63307)
- Adds new selectors to the site data store for retrieving site options. (#63305)
- Add `useHasSeenWhatsNewModalQuery` (#63148)
- Remove siteId from the siteSetupError state (#63284)
- Anchor: Add podcast ID, episode ID, and Spotify URL to onboard store (#63211)
- Use the stylesheet from the recipe and add pattern_ids arg to theme-setup (#63131)
- Update setDesignOnSite to account for Anchor templates (#63221)
- Add `is_fse_eligible` & `is_fse_active` to SiteDetails types (#63129)
- Add `useHappinessEngineersQuery` and peerDependencies @wordpress/data (#63198)
- Add eligibility data store (#62861)
- Add email support eligiblity check in site store (#63139)
- Add `getAtomicSoftwareInstallError` selector in site store (#63112)
- Add state for HappyChatAvailability in site store (#63136)
- Add `isJetpackSite` & `isEligibleForProPlan` selectors in site store (#63054)
- Add install software actions (#63065)
- Add selector for atomic software error (#63057)
- Add progressTitle and progress state to onboard store (#62889)
- Add a products-list data-store package (#62862)
- Site data-store selector to retrieve AT error code (#62927)
- Implement software status in store (#62951)
- Add selectors for available site features and requires Woo upgrade to (#62919)
- Add AT transfer status (#62909)
- Add setIntentOnSite action to site store (#62860)
- Add necessary actions for Woo transfer steps (#62865)
- Convert format-currency package to TypeScript (#62843)
- Setup error data store (#62771)
- Add HelpCenter store (#62706)
- Fetch site_vertical_id from site preferences on page load (#62726)
- Add site data-store selector for checking if a site is atomic (#62741)
- Add setPendingAction to onboard store (#62379)
- Add SiteSettings to site store (#62505)
- Add StoreAddress to onboard store (#62385)
- Add all missing data pieces and activate going to checkout on upgrading (#62530)
- Add hasActiveSiteFeature to the site store (#62531)
- Add `setIntent`, `setStartingPoint`, `setStoreType` actions to onboard store (#61732)
- Add `receiveSiteTagline`, `saveSiteTagline`, `setDesignOnSite` actions to onboard store (#61732)
- Add onboard store (#61998)
- Remove unused new_registration property (#61990)
- Update @wordpress/url to 3.3.2 (#61824)
- Update dependency typescript to ^4.5.5 (#60420)
- Update type definitions (#53623) (#56744) (#57715) (#59270) (#58154)
- Docs: Remove unnecessary React import from READMEs (#58353)
- Remove react native dependency (#57983)
- Update dependency redux to ^4.1.2 (#57688)
- Add connection mode information to the domains state (#55595)
- Refactor packages/data-stores to use import/order (#54486)
- Add reader store to enable enable font smoothing on wpcom interfaces (#52230)
- Add `is_blank_canvas` optional type to CreateSiteParams interface (#52288)
- Add dependency tslib (#52146)
- Add `subdomain_part` to Domain interface (#51251)

### Breaking changes

- Update to React 17 and latest WordPress packages (#54793) (#64093)
- Rename `hasSelectedDomain` selector to `hasSelectedDomainOrSubdomain` (#51741)

## 2.0.1

- Export the `ReturnOrGeneratorYieldUnion` type.

## 2.0.0

- Initial release with stores:
  - Domain Suggestions
  - Verticals
  - Verticals Templates
  - User
  - Site

## 1.0.0-alpha.1

- Move `@wordpress/data` to peer dependency.

## 1.0.0-alpha.0

- Initial prerelease
