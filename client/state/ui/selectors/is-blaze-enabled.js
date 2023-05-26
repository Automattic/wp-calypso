import { getSiteOption } from 'calypso/state/sites/selectors';
import 'calypso/state/ui/init';

export default function isBlazeEnabled( state, siteId ) {
	return !! getSiteOption( state, siteId, 'can_blaze' ) || false;
}
