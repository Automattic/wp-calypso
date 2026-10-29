# Name Pulse

The Name Pulse results mode for the WordPress.com domain search. `DomainSearch` renders `NamePulseResults` instead of the classic results page when `config.showNamePulseSearch` is on and there is a query.

`helpers/get-results-layout.ts` turns the query into a mode and the sections to render; `hooks/use-name-pulse-search.ts` regenerates the rows on every keystroke and sends the availability and suggestion requests once the query settles. `hooks/use-name-pulse-verdicts.ts` holds one react-query query per domain name (`[ 'name-pulse-domain', name ]`, five-minute TTL): pending is WAITING, error is UNKNOWN, data is the verdict, so a name that leaves the grid and comes back renders its verdict from cache without a request. Its query function batches the names asked for in one tick into parallel availability requests of 36; real-time checks from `components/result-row.tsx` write to the same key with `is_realtime`, which a bulk verdict never overwrites. Both hooks read their query options from the `queries` on the DomainSearch context, so tests and Storybook replace them through `test-helpers/factories/name-pulse.ts` instead of network mocks.

Premium names are priced apart from the rest. The bulk check quotes every name at its TLD's standard rate, so an exact match it flags premium holds its badge and a skeleton while `components/result-row.tsx` fetches the registry price from the per-domain `is-available` check, on the key the pre-cart check already uses. Suggestions come priced by the registry and render as they arrive. A premium name on a TLD we do not sell premiums on reads as unavailable.

A typed `name.tld` leaves the grid for its own card (`components/exact-match-card.tsx`), fed by the same per-domain check as the notice; a taken name has no card and its row stays in the grid. With `config.showBundleSuggestions` on, `hooks/use-name-pulse-bundle.ts` asks the per-domain bundle endpoint for the typed domain, then each Top result, skipping any that is not a `.com`, and shows the first bundle found: beside the exact-match card, or under Top results when there is none. Until then a placeholder with the card's layout holds that spot, so the bundle does not push the page down when it arrives. The backend only anchors bundles on an available `.com`, which is why the Top results are asked too.

`components/filter.tsx` is the classic filter button fed by the Name Pulse TLD list, shown on the results page only. Keyword suggestions are refetched with the selected endings as `tlds`. The exact-match grid and AI suggestions (which ignore `tlds`) are filtered client-side; a typed domain keeps its ending.

## Tracks events

Name Pulse follows the domain search Tracks proposal for i4: it keeps the classic events and adds props to them, and adds an event only where none fits. Every Tracks event it sends carries `search_ui_version: 'i4_v1'`; the classic page sends the same events with `search_ui_version: 'legacy_v1'`, as a baseline.

Changes to classic events:

| Event                                                      | When                                                                                                                                   | Added props                                                                                                                                                                |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `calypso_domain_search`                                    | Once per query or filter change that gets results or an error, sent with its result set. A query typed past before then is not counted | `search_id`, `query_shape` (`fqdn`, `single`, `keyword`, `ai`). `trigger` is the action that started it, as on the classic page                                            |
| `calypso_domain_search_results_suggestions_receive`        | Once per search, when every section has loaded or after 10 s                                                                           | `search_id`, `result_set_id`, `result_count_exact`, `result_count_top`, `result_count_exact_tlds`, `result_count_related`, `result_count_creative`                         |
| `calypso_traintracks_render`                               | Once per name, when its availability is known and its result set is recorded, taken names included                                     | `result_set_id`, `result_group` (`exact`, `top`, `exact_tlds`, `related`, `creative`), `is_ai_generated`, `availability_at_render` (`available`, `unavailable`, `unknown`) |
| `calypso_traintracks_interact`                             | A rendered name reaches the cart, with `calypso_domain_search_add_button_click`                                                        | The railcar it rendered with                                                                                                                                               |
| `calypso_domain_search_show_more_results`                  | "Show more" in a section; `page_number` counts per section                                                                             | `result_group`                                                                                                                                                             |
| `calypso_domain_search_results_use_my_domain_button_click` | "Use a domain I already own" in the header of the domain-only flow                                                                     | `source: header`                                                                                                                                                           |

`result_group` says where a result is shown: `exact` is the typed domain's card, `top` is Top results, `exact_tlds` is the typed name with other endings, then `related` and `creative`. `ui_position` and `position` count from 0 within that section. The railcar is `<result_set_id>-<n>`, numbering each card rendered in the result set, so it stays unique even when results reshuffle into the same slot. Later events for a name reuse the railcar, section and position it rendered with. `results` lists only the suggestions (Related and Creative matches), as on the classic page; `result_count` and the per-group counts cover every section. `root_vendor` is `name_pulse_exact`, `name_pulse_keyword` or `name_pulse_ai`.

New events, each with `section` and `flow_name`:

| Event                                   | When                                                      | Props                                                                                                                                                                      |
| --------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `calypso_domain_search_results_error`   | A search ends with nothing to show after an error or 10 s | `search_id`, `error_type` (`timeout`, `tlds_failed`, `suggestions_failed`, `availability_failed`)                                                                          |
| `calypso_domain_search_view_cart_click` | View cart                                                 |                                                                                                                                                                            |
| `calypso_domain_remove_button_click`    | A name leaves the cart                                    | `remove_source` (`row`, `cart`), `domain_name`; from a row `result_group`, `position` and `root_vendor`; from the cart `is_bundle` and, for a whole bundle, `domain_count` |
| `calypso_domain_search_query_clear`     | The input is emptied                                      | `previous_query_length`, `previous_word_count`                                                                                                                             |

## Imports

From outside this folder, import only through the index (`../../name-pulse`). Deep imports are blocked by ESLint. Code inside the folder may use any domain-search internals.

## Ownership

Owned by @Automattic/yolo (see `.github/CODEOWNERS`).
