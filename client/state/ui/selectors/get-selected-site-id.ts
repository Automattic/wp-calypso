import { IAppState } from 'calypso/state/types';
import 'calypso/state/ui/init';

export default function getSelectedSiteId( state: IAppState ): number | null {
	return state.ui.selectedSiteId;
}
