/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import supportArticlesAlternatesReducer from './reducer';

registerReducer( [ 'supportArticlesAlternates' ], supportArticlesAlternatesReducer );
