/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CurrentTheme from 'my-sites/themes/current-theme';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThanksModal from 'my-sites/themes/thanks-modal';
import { connectOptions } from './theme-options';
import Banner from 'components/banner';
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from 'lib/plans/constants';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ThemeShowcase from './theme-showcase';

const ConnectedSingleSiteWpcom = connectOptions(
	( props ) => {
		const { siteId, currentPlanSlug, translate } = props;

		return (
			<div>
				<SidebarNavigation />
				<CurrentTheme siteId={ siteId } />
				{ ( currentPlanSlug === PLAN_FREE || currentPlanSlug === PLAN_PERSONAL ) && <Banner
					plan={ PLAN_PREMIUM }
					title={ translate( 'Access all our premium themes with our Premium and Business plans!' ) }
					description={
						translate( 'Get advanced customization, more storage space, and video support along with all your new themes.' )
					}
					event="themes_plans_free_personal"
				/>
				}

				<ThemeShowcase { ...props } siteId={ siteId }>
					{ siteId && <QuerySitePlans siteId={ siteId } /> }
					{ siteId && <QuerySitePurchases siteId={ siteId } /> }
					<ThanksModal source={ 'list' } />
				</ThemeShowcase>
			</div>
		);
	}
 );

export default connect(
	( state, { siteId } ) => {
		const currentPlan = getCurrentPlan( state, siteId );
		return {
			currentPlanSlug: get( currentPlan, 'productSlug', null ),
		};
	}
)( ConnectedSingleSiteWpcom );
