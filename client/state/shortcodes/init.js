/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import shortcodesReducer from './reducer';

registerReducer( [ 'shortcodes' ], shortcodesReducer );
