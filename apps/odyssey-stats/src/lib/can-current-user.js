import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import config from './config-api';

export default ( siteId, capability ) =>
	canCurrentUser( config( 'intial_state' ) ?? {}, siteId, capability );
