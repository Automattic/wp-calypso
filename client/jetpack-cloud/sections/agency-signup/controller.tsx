import page, { type Callback } from 'page';
import AgencySignUp from 'calypso/jetpack-cloud/sections/agency-signup/primary/agency-signup';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';

export const requireNoPartnerRecordContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const partner = getCurrentPartner( state );

	// Users who already have a partner record should be redirected away from the signup form.
	if ( partner ) {
		page.redirect( partnerPortalBasePath() );
		return;
	}

	next();
};

export const signUpContext: Callback = ( context, next ) => {
	context.primary = <AgencySignUp />;
	next();
};
