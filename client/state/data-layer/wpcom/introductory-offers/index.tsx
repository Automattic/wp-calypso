import { translate } from 'i18n-calypso';
import {
	SITE_INTRO_OFFER_RECEIVE,
	SITE_INTRO_OFFER_REQUEST,
	SITE_INTRO_OFFER_REQUEST_FAILURE,
	SITE_INTRO_OFFER_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

const fetchIntroOffers = ( action: { siteId: number | 'none'; currency: string | undefined } ) => {
	return http(
		{
			method: 'GET',
			path: '/introductory-offers',
			apiNamespace: 'wpcom/v2',
			query: {
				site: typeof action.siteId === 'number' && action.siteId > 0 ? action.siteId : undefined,
				currency:
					typeof action.currency === 'string' && action.currency.length > 0
						? action.currency
						: undefined,
			},
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

const onUpdateError = ( action: { siteId: number | 'none' } ) => {
	return [
		{
			type: SITE_INTRO_OFFER_REQUEST_FAILURE,
			siteId: action.siteId,
		},
		errorNotice(
			translate( 'Error loading introductory discounts. Some displayed prices may be incorrect.' )
		),
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
