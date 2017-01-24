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
	getCurrentPlan,
	isCurrentPlanExpiring,
	isRequestingSitePlans
} from 'state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import DocumentHead from 'components/data/document-head';
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
		isRequestingSitePlans: PropTypes.bool,
		context: PropTypes.object
	};

	isLoading() {
		const { selectedSite, isRequestingSitePlans: isRequestingPlans } = this.props;

		return ! selectedSite || isRequestingPlans;
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
			context,
			currentPlan,
			isExpiring,
			isJetpack,
			translate,
		} = this.props;

		const currentPlanSlug = selectedSite.plan.product_slug,
			isLoading = this.isLoading();

		const { title, tagLine } = this.getHeaderWording( currentPlanSlug );

		return (
			<Main className="current-plan" wideLayout>
				<DocumentHead title={ translate( 'Plans', { textOnly: true } ) } />
				<QuerySites siteId={ selectedSiteId } />
				<QuerySitePlans siteId={ selectedSiteId } />
				{ selectedSiteId && ! isJetpack && <QuerySiteDomains siteId={ selectedSiteId } /> }

				<PlansNavigation
					path={ context.path }
					selectedSite={ selectedSite }
				/>

				{ ! isJetpack && this.renderDomainWarnings() }

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
			context: ownProps.context,
			currentPlan: getCurrentPlan( state, selectedSiteId ),
			isExpiring: isCurrentPlanExpiring( state, selectedSiteId ),
			isJetpack: isJetpackSite( state, selectedSiteId ),
			isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
			domains: getDecoratedSiteDomains( state, selectedSiteId ),
			hasDomainsLoaded: ! isRequestingSiteDomains( state, selectedSiteId )
		};
	}
)( localize( CurrentPlan ) );
