/**
 * Internal dependencies
 */
import { JETPACK_BENEFITS_REQUEST, JETPACK_BENEFITS_UPDATE } from 'calypso/state/action-types';
import type { Benefits, RequestJetpackBenefitsAction, UpdateJetpackBenefitsAction } from './types';

import 'calypso/state/data-layer/wpcom/jetpack/benefits';
import 'calypso/state/jetpack/init';

export const requestJetpackBenefits = (
	siteId: number,
	query: Record< string, string | number >
): RequestJetpackBenefitsAction => ( {
	type: JETPACK_BENEFITS_REQUEST,
	siteId,
	query,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

export const updateJetpackBenefits = (
	siteId: number,
	benefits: Benefits
): UpdateJetpackBenefitsAction => ( {
	type: JETPACK_BENEFITS_UPDATE,
	siteId,
	benefits,
} );
