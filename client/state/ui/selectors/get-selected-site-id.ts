import { IAppState } from 'calypso/state/types';
import 'calypso/state/ui/init';

/**
 * Returns the currently selected site ID.
 *
 * @param  {object}  state Global state tree
 * @returns {?number}       Selected site ID
 */
export default function getSelectedSiteId( state: IAppState ): number | null {
	return state.ui.selectedSiteId;
}
