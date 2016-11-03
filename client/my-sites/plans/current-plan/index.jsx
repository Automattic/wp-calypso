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
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { getPlan } from 'lib/plans';
import QuerySiteDomains from 'components/data/query-site-domains';
import { getDecoratedSiteDomains, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import DomainWarnings from 'my-sites/upgrades/components/domain-warnings';

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

		const planConstObj = getPlan( plan ),
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

	renderDomainWarnings() {
		const {
			domains,
			selectedSite,
			hasDomainsLoaded
		} = this.props;

		if ( hasDomainsLoaded ) {
			return (
				<DomainWarnings
					domains={ domains }
					selectedSite={ selectedSite }
					ruleWhiteList={ [
						'newDomainsWithPrimary',
						'newDomains',
						'unverifiedDomainsCanManage',
						'pendingGappsTosAcceptanceDomains',
						'unverifiedDomainsCannotManage',
						'wrongNSMappedDomains'
					] }
				/>
			);
		}
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
				<QuerySites siteId={ selectedSiteId } />
				<QuerySitePlans siteId={ selectedSiteId } />
				{ selectedSiteId && <QuerySiteDomains siteId={ selectedSiteId } /> }

				<PlansNavigation
					sitePlans={ sitePlans }
					path={ context.path }
					selectedSite={ selectedSite }
				/>

				{ this.renderDomainWarnings() }

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
						isPlaceholder={ isLoading }
					/>
				</ProductPurchaseFeatures>

				<TrackComponentView eventName={ 'calypso_plans_my_plan_view' } />
			</Main>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const selectedSite = getSelectedSite( state ),
			selectedSiteId = getSelectedSiteId( state );

		return {
			selectedSite,
			selectedSiteId,
			sitePlans: getPlansBySite( state, selectedSite ),
			context: ownProps.context,
			currentPlan: getCurrentPlan( state, getSelectedSiteId( state ) ),
			isExpiring: isCurrentPlanExpiring( state, getSelectedSiteId( state ) ),
			domains: getDecoratedSiteDomains( state, selectedSiteId ),
			hasDomainsLoaded: ! isRequestingSiteDomains( state, selectedSiteId )
		};
	}
)( localize( CurrentPlan ) );
