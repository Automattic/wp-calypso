/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import editorDeprecationGroupReducer from './reducer';

registerReducer( [ 'currentUser', 'inEditorDeprecationGroup' ], editorDeprecationGroupReducer );
