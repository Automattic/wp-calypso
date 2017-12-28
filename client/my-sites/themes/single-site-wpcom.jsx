/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { abtest } from 'client/lib/abtest';
import CurrentTheme from 'client/my-sites/themes/current-theme';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';
import ThanksModal from 'client/my-sites/themes/thanks-modal';
import { connectOptions } from './theme-options';
import Banner from 'client/components/banner';
import { PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM } from 'client/lib/plans/constants';
import { getCurrentPlan } from 'client/state/sites/plans/selectors';
import QuerySitePlans from 'client/components/data/query-site-plans';
import QuerySitePurchases from 'client/components/data/query-site-purchases';
import ThemeShowcase from './theme-showcase';
import { getSiteSlug } from 'client/state/sites/selectors';

const ConnectedSingleSiteWpcom = connectOptions( props => {
	const { siteId, siteSlug, currentPlanSlug, translate } = props;

	const upsellUrl = abtest( 'unlimitedThemeNudge' ) === 'show' && `/plans/${ siteSlug }`;
	return (
		<div>
			<SidebarNavigation />
			<CurrentTheme siteId={ siteId } />
			{ ( currentPlanSlug === PLAN_FREE || currentPlanSlug === PLAN_PERSONAL ) && (
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
			) }

			<ThemeShowcase { ...props } upsellUrl={ upsellUrl } siteId={ siteId }>
				{ siteId && <QuerySitePlans siteId={ siteId } /> }
				{ siteId && <QuerySitePurchases siteId={ siteId } /> }
				<ThanksModal source={ 'list' } />
			</ThemeShowcase>
		</div>
	);
} );

export default connect( ( state, { siteId } ) => {
	const currentPlan = getCurrentPlan( state, siteId );
	return {
		siteSlug: getSiteSlug( state, siteId ),
		currentPlanSlug: get( currentPlan, 'productSlug', null ),
	};
} )( ConnectedSingleSiteWpcom );
