/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Main from 'client/components/main';
import {
	getCurrentPlan,
	isCurrentPlanExpiring,
	isRequestingSitePlans,
} from 'client/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'client/state/ui/selectors';
import { isJetpackSite } from 'client/state/sites/selectors';
import DocumentHead from 'client/components/data/document-head';
import TrackComponentView from 'client/lib/analytics/track-component-view';
import PlansNavigation from 'client/my-sites/domains/navigation';
import ProductPurchaseFeatures from 'client/blocks/product-purchase-features';
import ProductPurchaseFeaturesList from 'client/blocks/product-purchase-features/product-purchase-features-list';
import CurrentPlanHeader from './header';
import QuerySites from 'client/components/data/query-sites';
import QuerySitePlans from 'client/components/data/query-site-plans';
import { getPlan } from 'client/lib/plans';
import QuerySiteDomains from 'client/components/data/query-site-domains';
import { getDecoratedSiteDomains } from 'client/state/sites/domains/selectors';
import DomainWarnings from 'client/my-sites/domains/components/domain-warnings';
import isSiteAutomatedTransfer from 'client/state/selectors/is-site-automated-transfer';
import SidebarNavigation from 'client/my-sites/sidebar-navigation';

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
		isAutomatedTransfer: PropTypes.bool,
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
					planName: planConstObj.getTitle(),
				},
			} );

		const tagLine = planConstObj.getTagline
			? planConstObj.getTagline()
			: translate(
					'Unlock the full potential of your site with all the features included in your plan.'
				);

		return {
			title: title,
			tagLine: tagLine,
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
			isAutomatedTransfer,
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

				<PlansNavigation path={ context.path } selectedSite={ selectedSite } />

				{ showDomainWarnings && (
					<DomainWarnings
						domains={ domains }
						position="current-plan"
						selectedSite={ selectedSite }
						ruleWhiteList={ [
							'newDomainsWithPrimary',
							'newDomains',
							'unverifiedDomainsCanManage',
							'pendingGappsTosAcceptanceDomains',
							'unverifiedDomainsCannotManage',
							'wrongNSMappedDomains',
						] }
					/>
				) }

				<ProductPurchaseFeatures>
					<CurrentPlanHeader
						selectedSite={ selectedSite }
						isPlaceholder={ isLoading }
						title={ title }
						tagLine={ tagLine }
						currentPlanSlug={ currentPlanSlug }
						currentPlan={ currentPlan }
						isExpiring={ isExpiring }
						isAutomatedTransfer={ isAutomatedTransfer }
					/>
					<ProductPurchaseFeaturesList plan={ currentPlanSlug } isPlaceholder={ isLoading } />
				</ProductPurchaseFeatures>

				<TrackComponentView eventName={ 'calypso_plans_my_plan_view' } />
			</Main>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const domains = getDecoratedSiteDomains( state, selectedSiteId );

	const isWpcom = ! isJetpackSite( state, selectedSiteId );
	const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

	return {
		selectedSite,
		selectedSiteId,
		domains,
		isAutomatedTransfer,
		context: ownProps.context,
		currentPlan: getCurrentPlan( state, selectedSiteId ),
		isExpiring: isCurrentPlanExpiring( state, selectedSiteId ),
		shouldShowDomainWarnings: isWpcom || isAutomatedTransfer,
		hasDomainsLoaded: !! domains,
		isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
	};
} )( localize( CurrentPlan ) );
