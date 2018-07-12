/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { getSitePlan } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Internal dependencies
 */
import CurrentTheme from 'my-sites/themes/current-theme';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThanksModal from 'my-sites/themes/thanks-modal';
import { connectOptions } from './theme-options';
import Banner from 'components/banner';
import { FEATURE_UNLIMITED_PREMIUM_THEMES, TYPE_PREMIUM } from 'lib/plans/constants';
import { findFirstSimilarPlanKey } from 'lib/plans';
import { hasFeature, isRequestingSitePlans } from 'state/sites/plans/selectors';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemeShowcase from './theme-showcase';
import { getSiteSlug } from 'state/sites/selectors';

export const ConnectedSingleSiteWpcom = props => {
	const {
		hasUnlimitedPremiumThemes,
		requestingSitePlans,
		currentPlanSlug,
		siteId,
		siteSlug,
		translate,
	} = props;

	const upsellUrl = `/plans/${ siteSlug }`;
	return (
		<div>
			<SidebarNavigation />
			<CurrentTheme siteId={ siteId } />
			{ ! requestingSitePlans &&
				! hasUnlimitedPremiumThemes && (
					<Banner
						plan={ findFirstSimilarPlanKey( currentPlanSlug, { type: TYPE_PREMIUM } ) }
						title={ translate(
							'Access all our premium themes with our Premium and Business plans!'
						) }
						description={ translate(
							'Get advanced customization, more storage space, and video support along with all your new themes.'
						) }
						event="themes_plans_free_personal"
					/>
				) }

			<ThemeShowcase { ...props } upsellUrl={ upsellUrl } siteId={ siteId }>
				{ siteId && <QuerySitePlans siteId={ siteId } /> }
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				<ThanksModal source={ 'list' } />
			</ThemeShowcase>
		</div>
	);
};

export default connect( ( state, { siteId } ) => ( {
	siteSlug: getSiteSlug( state, siteId ),
	currentPlanSlug: ( getSitePlan( state, getSelectedSiteId( state ) ) || {} ).product_slug,
	hasUnlimitedPremiumThemes: hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES ),
	requestingSitePlans: isRequestingSitePlans( state, siteId ),
} ) )( connectOptions( ConnectedSingleSiteWpcom ) );
