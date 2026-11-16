export const SHELVES_RETIRED_QUERY_ARG = 'retired';

export const SHELVES_RETIRED_QUERY_VALUE = 'shelves';

/** Where old `/reader/shelves` links land: the Reader, with the retirement modal open. */
export const SHELVES_RETIRED_PATH = `/reader?${ SHELVES_RETIRED_QUERY_ARG }=${ SHELVES_RETIRED_QUERY_VALUE }`;
