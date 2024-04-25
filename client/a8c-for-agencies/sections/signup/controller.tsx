import { type Callback } from '@automattic/calypso-router';
import { hideMasterbar } from 'calypso/state/ui/actions';
import AgencySignUp from './primary/agency-signup';

export const signUpContext: Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbar() );
	context.primary = <AgencySignUp />;
	next();
};
