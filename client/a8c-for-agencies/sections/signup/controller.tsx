import { type Callback } from '@automattic/calypso-router';
import { hideMasterbar } from 'calypso/state/ui/actions';
import { getSignupDataFromLocalStorage } from './lib/signup-data-to-local-storage';
import AgencySignUp from './primary/agency-signup';

export const signUpContext: Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbar() );
	context.primary = <AgencySignUp />;
	next();
};

export const signUpResumeContext: Callback = ( context, next ) => {
	const savedSignupData = JSON.stringify( getSignupDataFromLocalStorage() );
	context.primary = (
		<>
			<div>{ savedSignupData }</div>
		</>
	);
	next();
};
