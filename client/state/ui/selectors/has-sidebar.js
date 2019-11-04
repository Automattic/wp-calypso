/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSection from './get-section';

export default function hasSidebar( state ) {
	// this one is weird. defaults to true, so if true, fall through to the secondary prop on the section
	const val = state.ui.hasSidebar;
	if ( val === false ) {
		return false;
	}
	return get( getSection( state ), 'secondary', true );
}
