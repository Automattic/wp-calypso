/**
 * Internal dependencies
 */

import { isEditorLoaded } from 'state/ui/editor/selectors';

export default state => {
	return isEditorLoaded( state );
};
