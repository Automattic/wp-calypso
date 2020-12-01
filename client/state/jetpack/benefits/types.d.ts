/**
 * Internal dependencies
 */
import { JETPACK_BENEFITS_REQUEST, JETPACK_BENEFITS_UPDATE } from 'calypso/state/action-types';

export interface Benefit {
	name: string;
	title: string;
	description: string;
	value: number;
}

export interface Benefits {
	[ key: string ]: Benefit;
}

export interface BenefitsResponse {
	code: string;
	message: string;
	data?: string;
}

export type RequestJetpackBenefitsAction = {
	type: typeof JETPACK_BENEFITS_REQUEST;
	siteId: number;
	query: Record< string, string | number >;
	meta: {
		dataLayer: {
			trackRequest: true;
		};
	};
};

export type UpdateJetpackBenefitsAction = {
	type: typeof JETPACK_BENEFITS_UPDATE;
	siteId: number;
	benefits: Benefits;
};

export type JetpackBenefitsAction = RequestJetpackBenefitsAction | UpdateJetpackBenefitsAction;
