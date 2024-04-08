import page from '@automattic/calypso-router';
import { JETPACK_ACTIVITY_ID } from 'calypso/a8c-for-agencies/sections/sites/features/features';

export default function () {
	// Intercept the activity log route and redirect to the activity log feature
	page( '/activity-log/:site', ( context, next ) => {
		const { site } = context.params;
		//todo: get the current selected feature family instead of the hardcoded 'overview'
		page.replace( `/sites/overview/${ site }/${ JETPACK_ACTIVITY_ID }`, context.state, true, true );
		next();
	} );
}
