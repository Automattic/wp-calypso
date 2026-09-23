# Changelog

## 1.3.0

- Own the Launchpad data-fetching hooks (`useLaunchpad`, `useSortedLaunchpadTasks`, `updateLaunchpadSettings`, `useLaunchpadDismisser`, and their helpers), moved here from `@automattic/data-stores` ([#114328](https://github.com/Automattic/wp-calypso/pull/114328)).
- Route those requests through a host-supplied client by registering one with `setRequester` ([#114328](https://github.com/Automattic/wp-calypso/pull/114328)).
- Drop the `@automattic/data-stores` dependency, and with it 16 transitive packages including `@automattic/api-core`, `@automattic/calypso-products` and `@automattic/components`. Launchpad fetches the site fields it needs itself ([#114333](https://github.com/Automattic/wp-calypso/pull/114333)).
- Drop the unused `@wordpress/data` and `@wordpress/element` peer dependencies ([#114333](https://github.com/Automattic/wp-calypso/pull/114333)).
- Require `@wordpress/components` ^37.0.0 and `@wordpress/ui` ^0.18.0 ([#112947](https://github.com/Automattic/wp-calypso/pull/112947)).
- Keep the checklist item chevron inline on mobile ([#112779](https://github.com/Automattic/wp-calypso/pull/112779)).

## 1.2.4

- Drop the direct `@automattic/components` dependency, resolving a duplicate/mismatched version in the installed dependency tree ([#111979](https://github.com/Automattic/wp-calypso/pull/111979)).
- Drop unused and trivially-replaceable dependencies ([#111976](https://github.com/Automattic/wp-calypso/pull/111976)).

## 1.2.3

- Declare React 19 compatibility for package consumers (#111721).

## 1.2.1

- Bump the version since the previous 1.2.0 has the wrong package.json dependency versions

## 1.2.0

- Extend `onTaskClick` to support returning `false` to cancel the default task action ([#109434](https://github.com/Automattic/wp-calypso/pull/109434))

## 1.0.0

- Initial release
