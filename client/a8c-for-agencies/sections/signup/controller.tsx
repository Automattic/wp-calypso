import { type Callback } from '@automattic/calypso-router';
import { hideMasterbar } from 'calypso/state/ui/actions';
import AgencySignUp from './primary/agency-signup';
import AgencySignupFinish from './primary/agency-signup-finish';

export const signUpContext: Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbar() );
	context.primary = <AgencySignUp />;
	next();
};

export const finishSignUpContext: Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbar() );
	context.primary = <AgencySignupFinish />;
	next();
};
