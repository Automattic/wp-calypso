User Stats State
================

A module for managing the data which backs a user or site's Stats reporting features.

## Action Creators
* `createFetchActionsForModule`

### Actions
* `fetchSiteStats`

### Reducers
* `items`
* `fetchingItems`

### Selectors
* `getStatsItem`
* `isStatsItemFetching`

### Utils
* `getStatsTypesByModule`
* `getCompositeKey`
* `normalizeParams`
* `isDefined`

## Still `@TODO`:
* Persistence / injecting initial state
* Full feature parity with `StatsList`:
  * API timing
  * Error handling
  * Request retrying
* Tests
* Finish moving components away from `StatsList`
