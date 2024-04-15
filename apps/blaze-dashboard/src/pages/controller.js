import config from '@automattic/calypso-config';
import BlazeConnection from './connection';
import BlazeSetup from './setup/main';

export const setup = ( context, next ) => {
	context.primary = <BlazeSetup setupInfo={ config( 'need_setup' ) } />;
	next();
};

export const connection = ( context, next ) => {
	context.primary = <BlazeConnection />;
	next();
};
