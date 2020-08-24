/**
 * Internal dependencies
 */
import { withStorageKey } from 'state/utils';
import { EDITOR_DEPRECATION_GROUP_SET } from 'state/action-types';

export const editorDeprecationGroupReducer = ( state = '', { type, inEditorDeprecationGroup } ) =>
	type === EDITOR_DEPRECATION_GROUP_SET ? inEditorDeprecationGroup : state;

export default withStorageKey( 'inEditorDeprecationGroup', editorDeprecationGroupReducer );
