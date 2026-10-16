import type { AgencyEnablementResource } from '@automattic/api-core';
import type { MouseEvent } from 'react';

/**
 * Tracking callback injected by each host app (dashboard uses its analytics,
 * a8c-for-agencies dispatches a Redux `recordTracksEvent`).
 */
export type RecordTracksEvent = (
	eventName: string,
	properties?: Record< string, unknown >
) => void;

/** Where a resource's details were opened from, for tracking. */
export type ResourceSource = 'library' | 'recommended';

/**
 * Selects a resource from a card or list row, given the click that selected it
 * and, from a card, the card itself for the modal to grow out of.
 */
export type SelectResource = (
	resource: AgencyEnablementResource,
	event: MouseEvent,
	origin?: Element | null,
	source?: ResourceSource
) => void;

/** Narrows the library to resources sharing one of a card's badges. */
export type FilterResources = (
	field: 'featured' | 'content_type' | 'audience' | 'stage',
	value: string
) => void;
