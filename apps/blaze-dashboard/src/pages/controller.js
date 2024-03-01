import BlazeSetup from './setup/main';

export const setup = ( context, next ) => {
	context.primary = <BlazeSetup />;
	next();
};
