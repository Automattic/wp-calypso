/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import shortcodesReducer from './reducer';

registerReducer( [ 'shortcodes' ], shortcodesReducer );
