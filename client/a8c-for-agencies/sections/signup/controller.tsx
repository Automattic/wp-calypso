import { Context, type Callback } from '@automattic/calypso-router';
import page from '@automattic/calypso-router';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import AgencySignUp from './primary/agency-signup';

export function requireNoPartnerRecordContext( context: Context, next: () => void ): void {
	const state = context.store.getState();
	const partner = getActiveAgency( state );

	// Users who already have a partner record should be redirected away from the signup form.
	if ( partner ) {
		page.redirect( A4A_SITES_LINK );
		return;
	}

	next();
}

export const signUpContext: Callback = ( context, next ) => {
	context.primary = <AgencySignUp />;
	next();
};
