/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CurrentTheme from 'my-sites/themes/current-theme';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThanksModal from 'my-sites/themes/thanks-modal';
import { connectOptions } from './theme-options';
import Banner from 'components/banner';
import { FEATURE_UNLIMITED_PREMIUM_THEMES, PLAN_PREMIUM } from 'lib/plans/constants';
import { hasFeature, isRequestingSitePlans } from 'state/sites/plans/selectors';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemeShowcase from './theme-showcase';
import { getSiteSlug } from 'state/sites/selectors';
import config from 'config';
import { abtest } from 'lib/abtest';

const ConnectedSingleSiteWpcom = connectOptions( props => {
	const { hasUnlimitedPremiumThemes, requestingSitePlans, siteId, siteSlug, translate } = props;

	const displayUpsellBanner = ! requestingSitePlans && ! hasUnlimitedPremiumThemes;
	const bannerLocationBelowSearch =
		config.isEnabled( 'upsell/nudge-a-palooza' ) &&
		abtest( 'nudgeAPalooza' ) === 'themesNudgesUpdates';

	const upsellUrl = `/plans/${ siteSlug }`;
	let upsellBanner = null;
	if ( displayUpsellBanner ) {
		if ( bannerLocationBelowSearch ) {
			// This is just for english audience and is not translated on purpose, remember to add
			// translate() calls before removing a/b test check and enabling it for everyone
			upsellBanner = (
				<Banner
					plan={ PLAN_PREMIUM }
					className="is-theme-showcase-banner" // eslint-disable-line wpcalypso/jsx-classname-namespace
					title={ 'Unlock ALL premium themes with our Premium and Business plans!' }
					event="themes_plans_free_personal"
					callToAction={ 'View Plans' }
					forceHref={ true }
				/>
			);
		} else {
			upsellBanner = (
				<Banner
					plan={ PLAN_PREMIUM }
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
		<div>
			<SidebarNavigation />
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
		</div>
	);
} );

export default connect( ( state, { siteId } ) => ( {
	siteSlug: getSiteSlug( state, siteId ),
	hasUnlimitedPremiumThemes: hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES ),
	requestingSitePlans: isRequestingSitePlans( state, siteId ),
} ) )( ConnectedSingleSiteWpcom );
