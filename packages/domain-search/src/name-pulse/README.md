# Name Pulse

The Name Pulse results mode for the WordPress.com domain search. `DomainSearch` renders `NamePulseResults` instead of the classic results page when `config.showNamePulseSearch` is on and there is a query.

## Sections

1. **Search input** — the shared `SearchForm` in instant mode: keystrokes propagate after a 300 ms debounce, submit cancels the debounce.
2. **Top results** — three featured rows picked from the exact-match grid (`helpers/get-top-results.ts`).
3. **Exact match for “name”** — one row per TLD in `NAME_PULSE_TLDS`, availability checked in bulk batches; "Show more exact matches" reveals 12 more rows and checks them.
4. **More suggestions** — for queries of two or more words, keyword suggestions from the Name Pulse suggestions endpoint, with "Show more suggestions".

`helpers/get-results-layout.ts` turns the query into a mode (`empty`, `fqdn`, `single`, `keyword`, `ai`) and the section flags the hook and page read; the `fqdn` and `ai` rows are placeholders that keep the exact-match behaviour until those modes are built.

Each row shows the base name muted and the TLD bold, then the yearly price (or the sale price with the renewal price underneath), a Premium or Sale badge and an icon-only cart button. Unavailable rows show "Unavailable"; rows whose check failed show "Couldn’t check" and are retried on the next search.

The bulk check is zone-file based, so the real-time availability check still runs when a row is added to the cart, exactly like the classic suggestion CTA.

## Data

`hooks/use-name-pulse-search.ts` orchestrates one settled query; `hooks/use-name-pulse-availability.ts` batches the availability requests. Both read their query options from the `queries` on the DomainSearch context (`namePulseSuggestions`, `namePulseAvailability`), so tests and Storybook can replace them without network mocks.

## Not yet built

FQDN card for a typed `name.tld`, the "Protect your brand" bundle card, the free-first-year banner, the filter button, AI mode ("Creative matches") for four or more words.

## Imports

From outside this folder, import only through the index (`../../name-pulse`). Deep imports are blocked by ESLint. Code inside the folder may use any domain-search internals.

## Ownership

Owned by @Automattic/yolo (see `.github/CODEOWNERS`).
