import { PLAN_BUSINESS } from '@automattic/calypso-products';
import React from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import CurrentTheme from 'calypso/my-sites/themes/current-theme';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';
import ThemesHeader from './themes-header';

const ConnectedSingleSiteWpcom = connectOptions( ( props ) => {
	const { requestingSitePlans, siteId, isVip, siteSlug, translate, isJetpack } = props;

	const displayUpsellBanner = ! requestingSitePlans && ! isVip;
	const bannerLocationBelowSearch = ! isJetpack;

	const upsellUrl = `/plans/${ siteSlug }`;
	let upsellBanner = null;
	if ( displayUpsellBanner ) {
		upsellBanner = (
			<UpsellNudge
				plan={ PLAN_BUSINESS }
				className="themes__showcase-banner"
				title={ translate( 'Upload your own themes with our Business and eCommerce plans!' ) }
				event="calypso_themes_list_install_themes"
				forceHref={ true }
				showIcon={ true }
			/>
		);
	}

	return (
		<Main fullWidthLayout className="themes">
			<SidebarNavigation />
			<ThemesHeader />
			<CurrentTheme siteId={ siteId } />

			<ThemeShowcase
				{ ...props }
				upsellUrl={ upsellUrl }
				upsellBanner={ bannerLocationBelowSearch ? upsellBanner : null }
				siteId={ siteId }
			/>
		</Main>
	);
} );

export default connect( ( state, { siteId } ) => ( {
	isJetpack: isJetpackSite( state, siteId ),
	isVip: isVipSite( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
	requestingSitePlans: isRequestingSitePlans( state, siteId ),
} ) )( ConnectedSingleSiteWpcom );
