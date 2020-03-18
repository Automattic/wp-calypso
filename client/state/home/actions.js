/**
 * Internal dependencies
 */
import { HOME_CARDS_REQUEST, HOME_CARDS_SET } from 'state/action-types';
import 'state/data-layer/wpcom/sites/home/cards';

export const requestHomeCards = siteId => ( {
	type: HOME_CARDS_REQUEST,
	siteId,
} );

export const setHomeCards = ( siteId, cards ) => ( {
	type: HOME_CARDS_SET,
	siteId,
	cards,
} );
