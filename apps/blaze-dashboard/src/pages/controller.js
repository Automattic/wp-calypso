import config from '@automattic/calypso-config';
import BlazeSetup from './setup/main';

export const setup = ( context, next ) => {
	context.primary = <BlazeSetup setupInfo={ config( 'need_setup' ) } />;
	next();
};
