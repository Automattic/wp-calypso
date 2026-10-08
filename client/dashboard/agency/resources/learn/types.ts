import type { AgencyEnablementResource } from '@automattic/api-core';
import type { MouseEvent } from 'react';

/**
 * Tracking callback injected by each host app (dashboard uses its analytics,
 * a8c-for-agencies dispatches a Redux `recordTracksEvent`). Defaults to a no-op
 * so the shared components work without analytics wired up.
 */
export type RecordTracksEvent = (
	eventName: string,
	properties?: Record< string, unknown >
) => void;

/** Selects a resource from a card or list row, given the click that selected it. */
export type SelectResource = ( resource: AgencyEnablementResource, event: MouseEvent ) => void;

/** Narrows the library to resources sharing one of a card's badges. */
export type FilterResources = (
	field: 'featured' | 'content_type' | 'audience' | 'stage',
	value: string
) => void;
