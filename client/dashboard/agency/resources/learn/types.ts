/**
 * Tracking callback injected by each host app (dashboard uses its analytics,
 * a8c-for-agencies dispatches a Redux `recordTracksEvent`).
 */
export type RecordTracksEvent = (
	eventName: string,
	properties?: Record< string, unknown >
) => void;

/** Narrows the library to resources sharing one of a card's badges. */
export type FilterResources = (
	field: 'featured' | 'content_type' | 'audience' | 'stage',
	value: string
) => void;
