/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import activePromotionsReducer from './reducer';

registerReducer( [ 'activePromotions' ], activePromotionsReducer );
