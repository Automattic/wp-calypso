import type { AgencyResourceStage } from '@automattic/api-core';
import type { ReactNode } from 'react';

export type ResourceItem = {
	id: number;
	name: string;
	description: string;
	externalUrl: string;
	format: string;
	relatedProduct: string;
	relatedProductType: string;
	resourceType: string;
	previewImage: string;
	section: string;
	/** Only v2 resources carry a stage. */
	stage?: AgencyResourceStage;
	createdAt: string;
	updatedAt: string;
	// Computed field
	logo: ReactNode | null;
};

/**
 * Tracking callback injected by each host app (dashboard uses its analytics,
 * a8c-for-agencies dispatches a Redux `recordTracksEvent`). Defaults to a no-op
 * so the shared components work without analytics wired up.
 */
export type RecordTracksEvent = (
	eventName: string,
	properties?: Record< string, unknown >
) => void;
