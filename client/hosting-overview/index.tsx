import page, { type Context } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import hostingOverview from './controller';

export default function () {
	page( '/hosting-overview', ( { store: { getState } }: Context ) => {
		const state = getState();

		const primarySiteId = getPrimarySiteId( state );
		const selectedSite = getSelectedSite( state );

		page.redirect(
			`/hosting-overview/${
				selectedSite ? selectedSite?.slug : getSiteSlug( state, primarySiteId )
			}`
		);
	} );
	page( '/hosting-overview/:site', hostingOverview, makeLayout, clientRender );
}
