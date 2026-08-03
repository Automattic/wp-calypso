// Global kill switch for the Jetpack Stats commercial + traffic classifier paywall (STATS-387).
// The `jetpack-site-has-commercial-paywall` stickers are deliberately left in place so the cohort
// stays observable, so the client ignores the usage fields derived from them instead. Mirrors the
// backend switch (Usage_Info::COMMERCIAL_PAYWALL_KILLED): flip to `false` to restore the previous
// gating and upgrade-notice behaviour in one place, without reverting individual commits.
//
// This lives beside the paywall data rather than in `my-sites/stats/constants` so the dependency
// points down the layer stack, and because the selectors below are the only thing that reads it.
export const COMMERCIAL_PAYWALL_KILLED = true;
