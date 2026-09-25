# Name Pulse

The Name Pulse results mode for the WordPress.com domain search. `DomainSearch` renders `NamePulseResults` instead of the classic results page when `config.showNamePulseSearch` is on and there is a query.

`helpers/get-results-layout.ts` turns the query into a mode and the sections to render; `hooks/use-name-pulse-search.ts` regenerates the rows on every keystroke and sends the availability and suggestion requests once the query settles. `hooks/use-name-pulse-verdicts.ts` holds one react-query query per domain name (`[ 'name-pulse-domain', name ]`, five-minute TTL): pending is WAITING, error is UNKNOWN, data is the verdict, so a name that leaves the grid and comes back renders its verdict from cache without a request. Its query function batches the names asked for in one tick into parallel availability requests of 36; real-time checks from `components/result-row.tsx` write to the same key with `is_realtime`, which a bulk verdict never overwrites. Both hooks read their query options from the `queries` on the DomainSearch context, so tests and Storybook replace them through `test-helpers/factories/name-pulse.ts` instead of network mocks.

Premium names are priced apart from the rest. The bulk check quotes every name at its TLD's standard rate, so an exact match it flags premium holds its badge and a skeleton while `components/result-row.tsx` fetches the registry price from the per-domain `is-available` check, on the key the pre-cart check already uses. Suggestions come priced by the registry and render as they arrive. A premium name on a TLD we do not sell premiums on reads as unavailable.

A typed `name.tld` leaves the grid for its own card (`components/exact-match-card.tsx`), fed by the same per-domain check as the notice; a taken name has no card and its row stays in the grid. With `config.showBundleSuggestions` on, `hooks/use-name-pulse-bundle.ts` asks the per-domain bundle endpoint for the typed domain, then each Top result, and shows the first bundle found: beside the exact-match card, or under Top results when there is none. The backend only anchors bundles on an available `.com`, which is why the Top results are asked too.

## Not yet built

The filter button.

## Imports

From outside this folder, import only through the index (`../../name-pulse`). Deep imports are blocked by ESLint. Code inside the folder may use any domain-search internals.

## Ownership

Owned by @Automattic/yolo (see `.github/CODEOWNERS`).
