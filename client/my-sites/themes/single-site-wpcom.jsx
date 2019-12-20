/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import CurrentTheme from 'my-sites/themes/current-theme';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import ThanksModal from 'my-sites/themes/thanks-modal';
import { connectOptions } from './theme-options';
import Banner from 'components/banner';
import { FEATURE_UNLIMITED_PREMIUM_THEMES, PLAN_PREMIUM } from 'lib/plans/constants';
import { hasFeature, isRequestingSitePlans } from 'state/sites/plans/selectors';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemeShowcase from './theme-showcase';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { INSTALL_PLUGIN } from 'state/plugins/installed/constants';
import isVipSite from 'state/selectors/is-vip-site';
import { encodeQueryParameters } from 'state/http';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';

const ConnectedSingleSiteWpcom = connectOptions( props => {
	const {
		hasUnlimitedPremiumThemes,
		requestingSitePlans,
		isSiteUnlaunched,
		siteId,
		isVip,
		siteSlug,
		translate,
		isJetpack,
	} = props;

	const displayUpsellBanner = ! requestingSitePlans && ! hasUnlimitedPremiumThemes && ! isVip;
	const bannerLocationBelowSearch = ! isJetpack;

	const upsellUrl = `/plans/${ siteSlug }`;
	let upsellBanner = null;
	if ( displayUpsellBanner ) {
		const bannerURL =
			`/plans/${ siteSlug }?` +
			encodeQueryParameters( [
				[
					'redirect_to',
					`/checkout/thank-you/${ siteSlug }/:receiptId?` +
						encodeQueryParameters( [
							[ 'intent', INSTALL_PLUGIN ],
							[ 'site_unlaunched_before_upgrade', isSiteUnlaunched ? 'true' : 'false' ],
							[ 'redirect_to', document.location.pathname ],
							[ 'plan', PLAN_PREMIUM ],
						] ),
				],
			] );
		if ( bannerLocationBelowSearch ) {
			upsellBanner = (
				<Banner
					plan={ PLAN_PREMIUM }
					href={ bannerURL + '&customerType=business' }
					customerType="business"
					className="themes__showcase-banner"
					title={ translate( 'Unlock ALL premium themes with our Premium and Business plans!' ) }
					event="themes_plans_free_personal"
					callToAction={ translate( 'View Plans' ) }
					forceHref={ true }
				/>
			);
		} else {
			upsellBanner = (
				<Banner
					plan={ PLAN_PREMIUM }
					href={ bannerURL }
					title={ translate(
						'Access all our premium themes with our Premium and Business plans!'
					) }
					description={ translate(
						'Get advanced customization, more storage space, and video support along with all your new themes.'
					) }
					event="themes_plans_free_personal"
				/>
			);
		}
	}
	return (
		<Main className="themes">
			<SidebarNavigation />
			<FormattedHeader
				className="themes__page-heading"
				headerText={ translate( 'Themes' ) }
				align="left"
			/>
			<CurrentTheme siteId={ siteId } />
			{ bannerLocationBelowSearch ? null : upsellBanner }

			<ThemeShowcase
				{ ...props }
				upsellUrl={ upsellUrl }
				upsellBanner={ bannerLocationBelowSearch ? upsellBanner : null }
				siteId={ siteId }
			>
				{ siteId && <QuerySitePlans siteId={ siteId } /> }
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				<ThanksModal source={ 'list' } />
			</ThemeShowcase>
		</Main>
	);
} );

export default connect( ( state, { siteId } ) => ( {
	isJetpack: isJetpackSite( state, siteId ),
	isVip: isVipSite( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
	isSiteUnlaunched: isUnlaunchedSite( state, siteId ),
	hasUnlimitedPremiumThemes: hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES ),
	requestingSitePlans: isRequestingSitePlans( state, siteId ),
} ) )( ConnectedSingleSiteWpcom );
