/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import supportArticlesAlternatesReducer from './reducer';

registerReducer( [ 'supportArticlesAlternates' ], supportArticlesAlternatesReducer );
