/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import communityTranslatorReducer from './reducer';

registerReducer( [ 'communityTranslator' ], communityTranslatorReducer );
