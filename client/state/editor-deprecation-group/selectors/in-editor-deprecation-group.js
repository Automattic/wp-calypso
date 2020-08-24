/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/editor-deprecation-group/init';

export const inEditorDeprecationGroup = ( state ) =>
	get( state, 'currentUser.inEditorDeprecationGroup', null );

export default inEditorDeprecationGroup;
