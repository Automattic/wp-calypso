# Changelog

## 4.0.0

- Add `SubscriptionManager.useCacheKey` (#78434)
- Add handling for bulk domain transfers (#78599)
- Updates to be compatible with React 18 (#77046)
- Improve bulk domain transfer handling (#78684)
- Improve error handling in `useIsDomainCodeValid` (#78750)
- Add `useReadFeedSearch` hook (#78827)
- Add `useSiteSubscriptionsQueryProps` and `SiteSubscriptionsQueryPropsProvider` (#78896)
- Allow bulk transfers for domains that are already connected to a WordPress.com site (#78917)
- Add `is_enabled` field to `LaunchpadResponse` type (#78752)
- Specify user locale in call to theme-setup API (#79142)
- Add `useReadFeedSearchQuery` and `useReadFeedSiteQuery` to support better searches (#79038)
- Add price information to domain transfer details (#79300)
- Add `useReadFeedQuery` hook and support for non-WordPress.com feeds (#79363)
- Add `ImportSubscribers` to `SiteGoal` enum (#79022)
- Rename argument in `useGetWordPressSubdomain` for clarity (#79331)
- Allow unsubscribe actions for non-WordPress.com feeds (#79423)
- Add `setShouldImportDomainTransferDnsRecords` and `shouldImportDomainTransferDnsRecords` to onboarding store (#79210)
- Add `PLAN_MIGRATION_TRIAL_MONTHLY` plan constant (#79731)
- Fix incorrect use of `useIsLoggedIn` hook in reader mutations (#79833)
- Add `setShowSupportDoc` action for Help Center data store (#79741)
- Remove `shouldImportDnsRecords` field from `DomainTransferForm` (#80004)
- Update source site for post pattern previews (#80128)
- Add `useGetSingleCustomDotComDomainSuggestion` (#79937)
- Stop defaulting source site in `applyThemeWithPatterns` (#80135)
- Add 0-valued block gap spacing in `createCustomHomeTemplateContent` (#80212)
- Add `is_dismissed` field to `LaunchpadResponse` (#80116)
- Allow numeric `siteSlug` argument to `updateLaunchpadSettings` (#80405)
- Add `is_checklist_dismissed` field to `LaunchpadUpdateSettings` (#80115)
- Add `createVideoPressTvSite` action (#79178)
- Add `info` field to `SubscribeResponse` type (#80460)
- New `useAllDomainsQuery` which fetches all the current user's domains (#80539)
- Export `UserActions` type (#80475)
- Add `was_migration_trial` field to `SiteDetails` type (#80693)
- Add `useSiteDomainsQuery` and initial `DomainData` type (#80656)
- Add `selectedStorageAddOnsForPlans` reducer (#80777)
- Update `setDesignOnSite` implementation to avoid running Headstart in more cases (#80851)
- Add `useSiteQuery` and `getSiteQueryKey` (#80845)
- Add `theme_type` and `screenshot` to `useStarterDesignsQuery` response type (#80573)
- Add `getSiteDomainsQueryObject` to support sorting for `useSiteDomainsQuery` (#80935)
- Remove @testing-library/react-hooks in favor of @testing-library/react (#80914)
- Add `useDomainsBulkActionsMutation` (#80944)
- Update naming for storage options (#80874)
- Refine many fields in `DomainData` type (#80993)
- Add `options` argument to `useLaunchpad` (#79569)
- Refine `ID`, `blog_ID`, and `site_icon` fields in `SiteSubscriptionDetails` and add type guards (#81272)
- Refine `launchpad_screen` field in `LaunchpadResponse` type (#81317)
- Add `launchpad_screen` field for updates, add site launch action (#80661)
- Update mutation logic for reader queries (#81389)
- Add `useBulkDomainUpdateStatusQuery` to get status of bulk domain updates (#81312)
- Add `useSitePlans` and initial support for introductory offers for plans (#80430)
- Improve introductory offer support in `useSitePlans` (#81449)
- Add mutation options to `useDomainsBulkActionsMutation` and refine `DomainData.cannot_update_contact_info_reason` (#81068)
- Add `no_wpcom` flag to `useAllDomainsQuery` (#81667)
- Default `only_wordpressdotcom` to `false` in `useGetWordPressSubdomain` (#81471)
- Add `orig_cost_integer` to `PricedAPIPlan` type and deprecate `orig_cost` field (#81537)
- Cache results from `useSiteDomainsQuery` for 5 minutes (#81748)
- Add `AddOnMeta` type (#81338)
- Add `current_user_can_add_email`, `google_apps_subscription`, `titan_mail_subscription`, and `email_forwards_count` fields to `PartialDomainData` type, and enrich underlying type fields (#81749)
- Add `tld_maintenance_end_time` field to `PartialDomainData` type (#81830)
- Update `DomainUpdateStatus` type (#81818)
- Update the `auto_renewing` and `transfer_status` fields in the `DomainData` type (#81802)
- Add the `LaunchpadNavigator` data store (#81576)
- Add `blog_name` field to `DomainData` type (#81883)
- Add `is_commercial` field to `SiteDetailsOptions` type (#81820)
- Linting updates (#81899)
- Export `SelectedStorageOptionForPlans` type (#81340)
- Updates to the `LaunchpadNavigator` data store (#81907)
- Add `feed_ID` field to `SiteSubscriptionDetails` type (#82272)
- Support `is_pending_icann_verification` field in `Domain` type (#82372)
- Support filtering subscriptions by RSS feeds.
- Fixes for pending subscription management in the Reader (#82491)
- Update logic for calling API to set up theme on site (#81732)
- Add optional `expiry` field and required `introOffer.isOfferComplete` field for responses from `useSitePlans()` (#82517)
- Add `was_hosting_trial` to `SiteDetails` type (#82700)
- Allow null search terms in `useGetFreeSubdomainSuggestion()`, `useGetDomainSuggestions()`, `useGetWordPressSubdomain()`, and `useGetSingleCustomDotComDomainSuggestion()` (#82608)
- Add `subscriptionId` argument to `useSiteSubscriptionDetailsQuery` (#82944)

### Dependency updates

- Remove workspace dependency on `@automattic/happychat-connection` (#78433)
- Update `react` from ^17.0.2 to ^18.2.0 (#77046)
- Update `react-dom` from ^17.0.2 to ^18.2.0 (#77046)
- Update `@wordpress/api-fetch` from ^6.19.0 to ^6.20.0 (#77046)
- Update `@wordpress/data-controls` from ^2.22.0 to ^2.23.0 (#77046)
- Update `@wordpress/deprecated` from ^3.22.0 to ^3.23.0 (#77046)
- Update `@wordpress/data` from ^7.6.0 to ^8.0.0 (#77046)
- Add workspace dependency on `@automattic/calypso-analytics` (#78827)
- Add dependency on `@wordpress/url` ^3.24.0 (#78827)
- Update `@wordpress/api-fetch` from ^6.20.0 to ^6.33.0 (#78711)
- Update `@wordpress/data-controls` from ^2.23.0 to ^3.4.0 (#78711)
- Update `@wordpress/deprecated` from ^3.23.0 to ^3.36.0 (#78711)
- Update `@wordpress/url` from ^3.24.0 to ^3.37.0 (#78711)
- Update `@wordpress/data` from ^8.0.0 to ^9.5.0 (#78711)
- Update `@wordpress/api-fetch` from ^6.33.0 to ^6.35.0 (#79647)
- Update `@wordpress/data-controls` from ^3.4.0 to ^3.7.0 (#79647)
- Update `@wordpress/deprecated` from ^3.36.0 to ^3.38.0 (#79647)
- Update `@wordpress/url` from ^3.37.0 to ^3.39.0 (#79647)
- Update `typescript` from ^4.7.4 to ^5.1.6 (#74540)
- Update `@wordpress/data` from ^9.5.0 to ^9.8.0 (#80298)
- Add workspace dependency on `@automattic/calypso-products` (#80777)
- Update `nock` from ^12.0.3 to ^13.3.2 (#80832)
- Update `@wordpress/api-fetch` from ^6.35.0 to ^6.36.0 (#80475)
- Update `@wordpress/data-controls` from ^3.7.0 to ^3.8.0 (#80475)
- Update `@wordpress/deprecated` from ^3.38.0 to ^3.39.0 (#80475)
- Update `@wordpress/url` from ^3.39.0 to ^3.40.0 (#80475)
- Update `@wordpress/data` from ^9.8.0 to ^9.9.0 (#80475)
- Update `@wordpress/api-fetch` from ^6.36.0 to ^6.37.0 (#80783)
- Update `@wordpress/data-controls` from ^3.8.0 to ^3.9.0 (#80783)
- Update `@wordpress/deprecated` from ^3.39.0 to ^3.40.0 (#80783)
- Update `@wordpress/url` from ^3.40.0 to ^3.41.0 (#80783)
- Update `@wordpress/data` from ^9.9.0 to ^9.10.0 (#80783)
- Update `@wordpress/api-fetch` from ^6.37.0 to ^6.38.0 (#81291)
- Update `@wordpress/data-controls` from ^3.9.0 to ^3.10.0 (#81291)
- Update `@wordpress/deprecated` from ^3.40.0 to ^3.41.0 (#81291)
- Update `@wordpress/url` from ^3.41.0 to ^3.42.0 (#81291)
- Update `@wordpress/data` from ^9.10.0 to ^9.11.0 (#81291)
- Update `nock` from ^13.3.2 to ^13.3.3 (#81328)
- Update `typescript` from ^5.1.6 to ^5.2.2 (#81797)
 
### Breaking changes

- Remove `chatTag` and `iframe` data and related `set<X>` actions from Help Center store (#78179)
- Only allow `string` values for `title` and `description` fields in `LinksForSection` type (#78292)
- Remove `useHas3PC` hook; rename `HappyChatAvailability` type to `ChatAvailability`; update response type for `useSupportAvailability` (#78433)
- Update arguments for `setThemeOnSite` action for Site store (#78313)
- Remove `useIsDomainsUnlocked` and rename `bulkDomains` reducer to `bulkDomainNames` (#78684)
- Remove `hideFreePlan` from Onboard store (#77667)
- Rename bulk domain exports to domain transfer exports (#78806)
- Remove `useIsDomainCodeValid` (#78932)
- Stop exporting `getDomainSuggestionsQueryKey` (#79678)
- Rename `SiteSubscription` type to `SiteSubscriptionsResponseItem` and add `is_rss` field (#82359)
- Remove custom query and mutation hooks (based on `@tanstack/query`) from `support-queries/*`. These are moved to `@automattic/help-center`. (#78682)
- Move the following query and mutation hooks (based on `@tanstack/query`) from `queries/*` to `@automattic/help-center` (#78682)
  - `useIsWpOrgSite`
  - `useSiteAnalysis`
  - `useJetpackSearchAIQuery`
  - `useSubmitForumsMutation`
  - `useSupportAvailability`
  - `useSupportActivity`
  - `useUpdateZendeskUserFieldsMutation`
  - `useUserSites`
  - `useWpcomSite`
- Remove `setThemeOnSite`, `runThemeSetupOnSite`, and `applyThemeWithPatterns` (#80734)
- Update `SiteSubscriptionDetails` and `SiteSubscriptionDetailsResponse` types to accept generic `DateT` (#81288)
- Update `SiteDetails.options` type to possibly be undefined (#81997)

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
