import type {
	AgencyResourceAudience,
	AgencyResourceContentType,
	AgencyResourceFormat,
	AgencyResourceProduct,
	AgencyResourceStage,
} from '@automattic/api-core';
import type { ReactNode } from 'react';

export type ResourceItem = {
	id: number;
	name: string;
	description: string;
	externalUrl: string;
	product: AgencyResourceProduct;
	stage: AgencyResourceStage;
	audience: AgencyResourceAudience;
	contentType: AgencyResourceContentType;
	format: AgencyResourceFormat;
	isFeatured: boolean;
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
