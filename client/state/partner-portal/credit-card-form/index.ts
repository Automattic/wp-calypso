import { createReduxStore, register } from '@wordpress/data';
import * as actions from 'calypso/state/partner-portal/credit-card-form/actions';
import reducer from 'calypso/state/partner-portal/credit-card-form/reducer';
import * as selectors from 'calypso/state/partner-portal/credit-card-form/selectors';

export const creditCardStore = createReduxStore( 'credit-card', {
	reducer,
	actions,
	selectors,
} );

register( creditCardStore );
