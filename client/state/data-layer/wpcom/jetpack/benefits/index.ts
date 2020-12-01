/**
 * Internal dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { JETPACK_BENEFITS_REQUEST } from 'calypso/state/action-types';
import { updateJetpackBenefits } from 'calypso/state/jetpack/benefits/actions';
import type {
	Benefit,
	Benefits,
	BenefitsResponse,
	RequestJetpackBenefitsAction,
} from 'calypso/state/jetpack/benefits/types';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

const parseBenefitsData = ( benefitsResponse: BenefitsResponse ): Benefit[] => {
	return benefitsResponse.data ? JSON.parse( benefitsResponse.data ) : [];
};

export const fromApi = ( response: { data?: BenefitsResponse } ): Benefits => {
	if ( ! response.data ) {
		throw new Error( 'missing benefits' );
	}
	return parseBenefitsData( response.data ).reduce( ( allBenefits, benefit ) => {
		return {
			...allBenefits,
			[ benefit.name ]: benefit,
		};
	}, {} );
};

/**
 * Dispatches a request to fetch settings for a given site
 *
 * @param   {object}   action         Redux action
 * @returns {object}   Dispatched http action
 */
export const requestJetpackBenefits = ( action: RequestJetpackBenefitsAction ) => {
	const { siteId, query } = action;

	return http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/jetpack-blogs/' + siteId + '/rest-api/',
			query: {
				path: '/jetpack/v4/site/benefits/',
				query: JSON.stringify( query ),
				json: true,
			},
		},
		action
	);
};

const receiveJetpackBenefits = ( { siteId }: { siteId: number }, benefits: Benefits ) => (
	dispatch
) => {
	dispatch( updateJetpackBenefits( siteId, benefits ) );
};

registerHandlers( 'state/data-layer/wpcom/jetpack/benefits/index.js', {
	[ JETPACK_BENEFITS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestJetpackBenefits,
			onSuccess: receiveJetpackBenefits,
			fromApi,
		} ),
	],
} );
