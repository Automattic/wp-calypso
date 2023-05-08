import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import config from './config-api';

export default ( siteId: number, capability: string ) =>
	// TODO: fix `intial_state` typo.
	canCurrentUser( config( 'intial_state' ) || {}, siteId, capability );
