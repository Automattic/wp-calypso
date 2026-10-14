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

/**
 * Selects a resource from a card or list row, given the click that selected it
 * and, from a card, the card itself for the modal to grow out of.
 */
export type SelectResource = (
	resource: AgencyEnablementResource,
	event: MouseEvent,
	origin?: Element | null
) => void;
