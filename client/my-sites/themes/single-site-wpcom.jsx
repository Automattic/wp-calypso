import { isEnabled } from '@automattic/calypso-config';
import {
	PLAN_BUSINESS,
	FEATURE_UPLOAD_THEMES,
	FEATURE_PREMIUM_THEMES,
} from '@automattic/calypso-products';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import CurrentTheme from 'calypso/my-sites/themes/current-theme';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getCurrentPlan, isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';
import ThemesHeader from './themes-header';

const ConnectedSingleSiteWpcom = connectOptions( ( props ) => {
	const { currentPlan, isVip, requestingSitePlans, siteId, siteSlug, translate } = props;

	const displayUpsellBanner = ! requestingSitePlans && currentPlan && ! isVip;

	const upsellUrl = `/plans/${ siteSlug }`;
	let upsellBanner = null;
	if ( displayUpsellBanner ) {
		upsellBanner = isEnabled( 'themes/premium' ) ? (
			<UpsellNudge
				className="themes__showcase-banner"
				event="calypso_themes_list_premium_themes"
				feature={ FEATURE_PREMIUM_THEMES }
				plan={ PLAN_BUSINESS }
				title={ translate(
					'Unlock all premium themes with our Premium, Business and eCommerce plans!'
				) }
				forceHref={ true }
				showIcon={ true }
			/>
		) : (
			<UpsellNudge
				className="themes__showcase-banner"
				event="calypso_themes_list_install_themes"
				feature={ FEATURE_UPLOAD_THEMES }
				plan={ PLAN_BUSINESS }
				title={ translate( 'Upload your own themes with our Business and eCommerce plans!' ) }
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
				upsellBanner={ upsellBanner }
				siteId={ siteId }
			/>
		</Main>
	);
} );

export default connect( ( state, { siteId } ) => ( {
	isVip: isVipSite( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
	requestingSitePlans: isRequestingSitePlans( state, siteId ),
	currentPlan: getCurrentPlan( state, siteId ),
} ) )( ConnectedSingleSiteWpcom );
