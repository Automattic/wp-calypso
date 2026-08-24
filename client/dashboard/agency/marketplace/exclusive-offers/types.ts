import type { ReactNode } from 'react';

export type PartnerOffer = {
	id: string;
	type?: string;
	offerType: string;
	product?: string;
	productType?: string;
	logo: ReactNode;
	title: string;
	description: string;
	termsUrl?: string;
	cta: {
		label: string;
		url: string;
		purchase_type?: string;
		external?: boolean;
	};
};

/**
 * Tracking callback injected by each host app (dashboard uses its analytics,
 * a8c-for-agencies dispatches a Redux `recordTracksEvent`). Defaults to a no-op
 * so the shared component works without analytics wired up.
 */
export type RecordTracksEvent = (
	eventName: string,
	properties?: Record< string, unknown >
) => void;
