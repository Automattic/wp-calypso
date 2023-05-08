import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import config from './config-api';

export default ( siteId: number, capability: string ) =>
	// Be compatible with the old `intial_state` typo.
	canCurrentUser( config( 'initial_state' ) || config( 'intial_state' ) || {}, siteId, capability );
