import {
	SITE_INTRO_OFFER_RECEIVE,
	SITE_INTRO_OFFER_REQUEST,
	SITE_INTRO_OFFER_REQUEST_FAILURE,
	SITE_INTRO_OFFER_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const fetchIntroOffers = ( action: { siteId: number } ) => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/intro-offers`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const onUpdateSuccess = ( action: { siteId: number }, response: unknown ) => {
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

registerHandlers( 'state/data-layer/wpcom/sites/intro-offers/index.js', {
	[ SITE_INTRO_OFFER_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchIntroOffers,
			onSuccess: onUpdateSuccess,
			onError: onUpdateError,
		} ),
	],
} );
