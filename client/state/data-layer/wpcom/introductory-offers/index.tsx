import {
	SITE_INTRO_OFFER_RECEIVE,
	SITE_INTRO_OFFER_REQUEST,
	SITE_INTRO_OFFER_REQUEST_FAILURE,
	SITE_INTRO_OFFER_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const fetchIntroOffers = ( action: { siteId: number | 'none' } ) => {
	return http(
		{
			method: 'GET',
			path: `/introductory-offers`,
			apiNamespace: 'wpcom/v2',
			query:
				typeof action.siteId === 'number' && action.siteId > 0
					? {
							site: action.siteId,
					  }
					: undefined,
		},
		action
	);
};

const onUpdateSuccess = ( action: { siteId: number | 'none' }, response: unknown ) => {
	return [
		{
			type: SITE_INTRO_OFFER_REQUEST_SUCCESS,
			siteId: action.siteId,
		},
		{
			type: SITE_INTRO_OFFER_RECEIVE,
			siteId: action.siteId,
			payload: response,
		},
	];
};

const onUpdateError = () => {
	return [
		{
			type: SITE_INTRO_OFFER_REQUEST_FAILURE,
		},
	];
};

registerHandlers( 'state/data-layer/wpcom/intro-offers/index.js', {
	[ SITE_INTRO_OFFER_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchIntroOffers,
			onSuccess: onUpdateSuccess,
			onError: onUpdateError,
		} ),
	],
} );
