/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { HOME_CARDS_REQUEST } from 'state/action-types';
import { setHomeCards } from 'state/home/actions';

const requestCards = action => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/home/cards`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};

const setCards = ( { siteId }, cards ) => setHomeCards( siteId, cards );

registerHandlers( 'state/data-layer/wpcom/sites/home/cards/index.js', {
	[ HOME_CARDS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestCards,
			onSuccess: setCards,
		} ),
	],
} );
