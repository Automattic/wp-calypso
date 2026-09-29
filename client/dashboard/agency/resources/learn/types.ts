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

export type ResourceContentType = string;

export type ResourceFormat =
	| 'PDF'
	| 'Video'
	| 'Webpage'
	| 'Google Slides'
	| 'Google Docs'
	| 'Google Sheets';

export type LibraryResource = {
	id: string;
	title: string;
	description: string;
	product: string;
	products?: string[];
	stage: string;
	audience: string;
	contentType: ResourceContentType;
	format: ResourceFormat;
	url: string;
};
