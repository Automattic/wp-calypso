/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import {
	getPlansBySite,
	getCurrentPlan,
	isCurrentPlanExpiring
} from 'state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import TrackComponentView from 'lib/analytics/track-component-view';
import PlansNavigation from 'my-sites/upgrades/navigation';
import ProductPurchaseFeatures from 'blocks/product-purchase-features';
import ProductPurchaseFeaturesList from 'blocks/product-purchase-features/product-purchase-features-list';
import CurrentPlanHeader from './header';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { plansList, PLAN_BUSINESS } from 'lib/plans/constants';

class CurrentPlan extends Component {
	static propTypes = {
		selectedSiteId: PropTypes.number,
		selectedSite: PropTypes.object,
		sitePlans: PropTypes.object,
		context: PropTypes.object
	};

	isLoading() {
		const { selectedSite, sitePlans } = this.props;

		return ! selectedSite || ! sitePlans.hasLoadedFromServer;
	}

	getHeaderWording( plan ) {
		const { translate } = this.props;

		const planConstObj = plansList[ plan ],
			title = translate( 'Your site is on a %(planName)s plan', {
				args: {
					planName: planConstObj.getTitle()
				}
			} );

		let tagLine = translate( 'Unlock the full potential of your site with all the features included in your plan.' );

		if ( plan === PLAN_BUSINESS ) {
			tagLine = translate( 'Learn more about everything included with Business and take advantage of' +
				' its professional features.' );
		}

		return {
			title: title,
			tagLine: tagLine
		};
	}

	render() {
		const {
			selectedSite,
			selectedSiteId,
			sitePlans,
			context,
			currentPlan,
			isExpiring
		} = this.props;

		const currentPlanSlug = selectedSite.plan.product_slug,
			isLoading = this.isLoading();

		const { title, tagLine } = this.getHeaderWording( currentPlanSlug );

		return (
			<Main className="current-plan" wideLayout>
				{ selectedSiteId && <QuerySites siteId={ selectedSiteId } /> }
				<QuerySitePlans siteId={ selectedSiteId } />

				<PlansNavigation
					sitePlans={ sitePlans }
					path={ context.path }
					selectedSite={ selectedSite }
				/>

				<ProductPurchaseFeatures>
					<CurrentPlanHeader
						selectedSite={ selectedSite }
						isPlaceholder={ isLoading }
						title={ title }
						tagLine={ tagLine }
						currentPlanSlug={ currentPlanSlug }
						currentPlan={ currentPlan }
						isExpiring={ isExpiring }
					/>
					<ProductPurchaseFeaturesList
						plan={ currentPlanSlug }
						selectedSite={ selectedSite }
						sitePlans={ sitePlans }
						isPlaceholder={ isLoading }
					/>
				</ProductPurchaseFeatures>

				<TrackComponentView eventName={ 'calypso_plans_my-plan_view' } />
			</Main>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const selectedSite = getSelectedSite( state );

		return {
			selectedSite,
			selectedSiteId: getSelectedSiteId( state ),
			sitePlans: getPlansBySite( state, selectedSite ),
			context: ownProps.context,
			currentPlan: getCurrentPlan( state, getSelectedSiteId( state ) ),
			isExpiring: isCurrentPlanExpiring( state, getSelectedSiteId( state ) )
		};
	}
)( localize( CurrentPlan ) );
