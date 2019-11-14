import { dropRightWhile, last } from 'lodash';

/**
 * Internal dependencies
 */
import { getRouteHistory } from 'state/ui/action-log/selectors';
import getPreviousPath from 'state/selectors/get-previous-path';

/**
 * Checking if the last route is a checklist route while ignoring navigation in block editor
 * @param {Object} state  Global state tree
 * @return {boolean} Whether or not the last non block editor route is a checklist route
 */

export default function isLastNonEditorRouteChecklist( state ) {
	// A easy out check for handling [most] checklist referrals to the block editor
	if ( getPreviousPath( state ).includes( '/checklist/' ) ) {
		return true;
	}

	// Ignoring in-editor navigation (ie, in the context of full-site-editing)
	const lastNonEditorRoute = last(
		dropRightWhile( getRouteHistory( state ), ( { path } ) => path.includes( '/block-editor/' ) )
	);

	// Handles referrals from checklist while in-editor navigation has recently occurred
	if ( lastNonEditorRoute && lastNonEditorRoute.path.includes( '/checklist/' ) ) {
		return true;
	}

	return false;
}
