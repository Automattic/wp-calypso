import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getState from './get-state';

export default ( siteId: number, capability: string ) =>
	// TODO: fix `intial_state` typo.
	canCurrentUser( getState(), siteId, capability );
