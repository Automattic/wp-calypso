import { getSiteOption } from 'calypso/state/sites/selectors';
import getSelectedSite from './get-selected-site';
import 'calypso/state/ui/init';

export default function isBlazeEnabled( state ) {
	return !! getSiteOption( state, getSelectedSite( state ).ID, 'can_blaze' ) || false;
}
