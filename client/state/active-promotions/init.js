/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import activePromotionsReducer from './reducer';

registerReducer( [ 'activePromotions' ], activePromotionsReducer );
