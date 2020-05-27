/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import checklistReducer from './reducer';

registerReducer( [ 'checklist' ], checklistReducer );
