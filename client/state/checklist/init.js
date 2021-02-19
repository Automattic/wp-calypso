/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import checklistReducer from './reducer';

registerReducer( [ 'checklist' ], checklistReducer );
