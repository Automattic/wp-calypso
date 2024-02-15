import { recordTracksEvent } from '@automattic/calypso-analytics';
import config, { disable, enable, isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import { Banner } from 'calypso/components/banner';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import { sitesPath } from 'calypso/lib/jetpack/paths';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import ConnectUrl from './connect-url';
import DashboardOverview from './dashboard-overview';
import Header from './header';

export const agencyDashboardContext: Callback = ( context, next ) => {
	const {
		s: search,
		page: contextPage,
		issue_types,
		sort_field,
		sort_direction,
		origin,
	} = context.query;
	const filter = {
		issueTypes: issue_types?.split( ',' ),
		showOnlyFavorites: context.params.filter === 'favorites',
	};
	const sort = {
		field: sort_field,
		direction: sort_direction,
	};
	const state = context.store.getState();
	const isAgency = isAgencyUser( state );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	if ( ! isAgency || ! isAgencyEnabled ) {
		// Redirect to Jetpack.com if the user is not an agency user & the origin is wp-admin
		if ( origin === 'wp-admin' ) {
			recordTracksEvent( 'calypso_jetpack_manage_redirect_to_manage_in_jetpack_dot_com' );
			window.location.href = 'https://jetpack.com/manage/';
			return;
		}
		return page.redirect( '/' );
	}

	const showSitesDashboardV2 =
		isSectionNameEnabled( 'jetpack-cloud-agency-sites-v2' ) &&
		context.section.paths[ 0 ] === sitesPath();

	let bannerDescription =
		'Activate the new design for the Sites Dashboard section and enjoy the new features we have for you.';
	let bannerTitle = 'Good news! Now you can check our new Sites Dashboard design!';
	if ( showSitesDashboardV2 && ! isEnabled( 'jetpack/manage-sites-v2-menu' ) ) {
		enable( 'jetpack/manage-sites-v2-menu' );
	}
	if ( showSitesDashboardV2 && isEnabled( 'jetpack/manage-sites-v2-menu' ) ) {
		bannerTitle = 'You are using the new Sites Dashboard design!';
		bannerDescription =
			'Any feedback? We would love to hear from you! If you want to go back to the old design, you can deactivate it here.';
	}

	const currentPage = parseInt( contextPage ) || 1;
	context.header = <Header />;
	context.secondary = <JetpackManageSidebar path={ context.path } />;
	context.primary = (
		<>
			{ isSectionNameEnabled( 'jetpack-cloud-agency-sites-v2' ) && (
				<Banner
					title={ bannerTitle }
					description={ bannerDescription }
					callToAction={ showSitesDashboardV2 ? 'Deactivate' : 'Activate' }
					horizontal
					jetpack
					onClick={ () => {
						if ( showSitesDashboardV2 ) {
							disable( 'jetpack/manage-sites-v2-menu' );
							document.location.href = '/dashboard'; // full reload
						} else {
							enable( 'jetpack/manage-sites-v2-menu' );
							page.redirect( '/sites' );
						}
					} }
				/>
			) }
			<DashboardOverview
				search={ search }
				currentPage={ currentPage }
				filter={ filter }
				sort={ sort }
				showSitesDashboardV2={ showSitesDashboardV2 }
			/>
		</>
	);

	// By definition, Sites Management does not select any one specific site
	context.store.dispatch( setAllSitesSelected() );

	next();
};

export const connectUrlContext: Callback = ( context, next ) => {
	context.header = <Header />;
	context.secondary = <JetpackManageSidebar path={ context.path } />;
	context.primary = <ConnectUrl />;
	next();
};
