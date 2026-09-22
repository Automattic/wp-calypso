# Name Pulse

The Name Pulse results mode for the WordPress.com domain search. `DomainSearch` renders `NamePulseResults` instead of the classic results page when `config.showNamePulseSearch` is on and there is a query.

`helpers/get-results-layout.ts` turns the query into a mode and the sections to render; `hooks/use-name-pulse-search.ts` regenerates the rows on every keystroke and sends the availability and suggestion requests once the query settles, and `hooks/use-name-pulse-availability.ts` batches the availability checks. Both read their query options from the `queries` on the DomainSearch context, so tests and Storybook replace them through `test-helpers/factories/name-pulse.ts` instead of network mocks.

## Not yet built

FQDN card for a typed `name.tld`, the "Protect your brand" bundle card, the filter button.

## Imports

From outside this folder, import only through the index (`../../name-pulse`). Deep imports are blocked by ESLint. Code inside the folder may use any domain-search internals.

## Ownership

Owned by @Automattic/yolo (see `.github/CODEOWNERS`).
