import { type Callback } from '@automattic/calypso-router';
import AgencySignUp from './primary/agency-signup';

export const signUpContext: Callback = ( context, next ) => {
	context.primary = <AgencySignUp />;
	next();
};
