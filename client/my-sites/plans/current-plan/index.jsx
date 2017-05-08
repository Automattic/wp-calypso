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
import { getDecoratedSiteDomains } from 'state/sites/domains/selectors';
import DomainWarnings from 'my-sites/upgrades/components/domain-warnings';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import SidebarNavigation from 'my-sites/sidebar-navigation';

class CurrentPlan extends Component {
	static propTypes = {
		selectedSiteId: PropTypes.number,
		selectedSite: PropTypes.object,
		isRequestingSitePlans: PropTypes.bool,
		context: PropTypes.object,
		domains: PropTypes.array,
		currentPlan: PropTypes.object,
		isExpiring: PropTypes.bool,
		shouldShowDomainWarnings: PropTypes.bool,
		hasDomainsLoaded: PropTypes.bool,
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

	render() {
		const {
			selectedSite,
			selectedSiteId,
			domains,
			context,
			currentPlan,
			isExpiring,
			shouldShowDomainWarnings,
			hasDomainsLoaded,
			translate,
		} = this.props;

		const currentPlanSlug = selectedSite.plan.product_slug,
			isLoading = this.isLoading();

		const { title, tagLine } = this.getHeaderWording( currentPlanSlug );

		const shouldQuerySiteDomains = selectedSiteId && shouldShowDomainWarnings;
		const showDomainWarnings = hasDomainsLoaded && shouldShowDomainWarnings;

		return (
			<Main className="current-plan" wideLayout>
				<SidebarNavigation />
				<DocumentHead title={ translate( 'Plans', { textOnly: true } ) } />
				<QuerySites siteId={ selectedSiteId } />
				<QuerySitePlans siteId={ selectedSiteId } />
				{ shouldQuerySiteDomains && <QuerySiteDomains siteId={ selectedSiteId } /> }

				<PlansNavigation
					path={ context.path }
					selectedSite={ selectedSite }
				/>

				{ showDomainWarnings && <DomainWarnings
						domains={ domains }
						selectedSite={ selectedSite }
						ruleWhiteList={ [
							'newDomainsWithPrimary',
							'newDomains',
							'unverifiedDomainsCanManage',
							'pendingGappsTosAcceptanceDomains',
							'unverifiedDomainsCannotManage',
							'wrongNSMappedDomains'
						] } />
				}

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
		const selectedSite = getSelectedSite( state );
		const selectedSiteId = getSelectedSiteId( state );
		const domains = getDecoratedSiteDomains( state, selectedSiteId );

		const isWpcom = ! isJetpackSite( state, selectedSiteId );
		const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

		return {
			selectedSite,
			selectedSiteId,
			domains,
			context: ownProps.context,
			currentPlan: getCurrentPlan( state, selectedSiteId ),
			isExpiring: isCurrentPlanExpiring( state, selectedSiteId ),
			shouldShowDomainWarnings: isWpcom || isAutomatedTransfer,
			hasDomainsLoaded: !! domains,
			isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
		};
	}
)( localize( CurrentPlan ) );
