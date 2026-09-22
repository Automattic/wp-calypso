/**
 * TLDs preferred for the "Top results" cards, in order.
 */
export const NAME_PULSE_TOP_RESULTS_TLDS: readonly string[] = [ 'blog', 'com', 'app', 'dev' ];

export const NAME_PULSE_TOP_RESULTS_COUNT = 3;

/**
 * Rows per "Show more" click and initial rows per section.
 */
export const NAME_PULSE_PAGE_SIZE = 12;

/**
 * Domains per availability-check request (endpoint maximum is 50).
 */
export const NAME_PULSE_AVAILABILITY_BATCH_SIZE = 36;

/**
 * Pause after the last keystroke before the availability and suggestion requests go out.
 */
export const NAME_PULSE_QUERY_SETTLE_MS = 300;

/**
 * Exact-match rows checked as soon as a query settles. Single-word searches
 * check a full batch; multi-word searches check the first page plus a buffer.
 */
export const NAME_PULSE_INITIAL_CHECK_SINGLE_WORD = 36;
export const NAME_PULSE_INITIAL_CHECK_MULTI_WORD = 24;

/**
 * How long skeleton slots and "checking" rows wait for a response before giving up.
 */
export const NAME_PULSE_SKELETON_TIMEOUT_MS = 10000;

/**
 * Passed to the suggestions endpoint so it gives up on its providers before the
 * skeletons do. Keyword suggestions use the endpoint's own default.
 */
export const NAME_PULSE_AI_TIMEOUT_MS = 10000;

/**
 * How long a cached availability verdict is trusted, and kept once no row reads it.
 */
export const NAME_PULSE_VERDICT_TTL_MS = 5 * 60 * 1000;
