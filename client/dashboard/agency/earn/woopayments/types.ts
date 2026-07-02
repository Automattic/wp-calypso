/**
 * Tracking callback injected by each host app (dashboard uses its analytics,
 * a8c-for-agencies dispatches a Redux `recordTracksEvent`). Never call
 * `useAnalytics` directly from shared WooPayments code; always go through
 * this injected callback so the same components work in both hosts.
 */
export type RecordTracksEvent = ( name: string, properties?: Record< string, unknown > ) => void;
