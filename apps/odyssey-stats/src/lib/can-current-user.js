import config from './config-api';

export default ( siteId, capability ) =>
	!! config( 'intial_state' )?.currentUser?.capabilities?.[ siteId ]?.[ capability ];
