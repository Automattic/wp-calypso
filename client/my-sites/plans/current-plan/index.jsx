/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import {
	getCurrentPlan,
	isCurrentPlanExpiring,
	isRequestingSitePlans,
} from 'state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import DocumentHead from 'components/data/document-head';
import TrackComponentView from 'lib/analytics/track-component-view';
import PlansNavigation from 'my-sites/plans/navigation';
import ProductPurchaseFeaturesList from 'blocks/product-purchase-features-list';
import CurrentPlanHeader from './header';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlan } from 'lib/plans';
import QuerySiteDomains from 'components/data/query-site-domains';
import { getDecoratedSiteDomains } from 'state/sites/domains/selectors';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackChecklist from 'my-sites/plans/current-plan/jetpack-checklist';
import { isEnabled } from 'config';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import CurrentPlanThankYouCard from './current-plan-thank-you-card';

/**
 * Style dependencies
 */
import './style.scss';

class CurrentPlan extends Component {
	static propTypes = {
		selectedSiteId: PropTypes.number,
		selectedSite: PropTypes.object,
		isRequestingSitePlans: PropTypes.bool,
		path: PropTypes.string.isRequired,
		domains: PropTypes.array,
		currentPlan: PropTypes.object,
		isExpiring: PropTypes.bool,
		requestThankYou: PropTypes.bool,
		shouldShowDomainWarnings: PropTypes.bool,
		hasDomainsLoaded: PropTypes.bool,
		showJetpackChecklist: PropTypes.bool,
		showThankYou: PropTypes.bool,
	};

	isLoading() {
		const { selectedSite, isRequestingSitePlans: isRequestingPlans } = this.props;

		return ! selectedSite || isRequestingPlans;
	}

	getHeaderWording( planConstObj ) {
		const { translate } = this.props;

		const title = translate( 'Your site is on a %(planName)s plan', {
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
			currentPlan,
			domains,
			hasDomainsLoaded,
			isExpiring,
			path,
			selectedSite,
			selectedSiteId,
			shouldShowDomainWarnings,
			showJetpackChecklist,
			translate,
		} = this.props;

		const currentPlanSlug = selectedSite.plan.product_slug,
			isLoading = this.isLoading();

		const planConstObj = getPlan( currentPlanSlug ),
			planFeaturesHeader = translate( '%(planName)s plan features', {
				args: { planName: planConstObj.getTitle() },
			} );

		const { title, tagLine } = this.getHeaderWording( planConstObj );

		const shouldQuerySiteDomains = selectedSiteId && shouldShowDomainWarnings;
		const showDomainWarnings = hasDomainsLoaded && shouldShowDomainWarnings;
		return (
			<Main className="current-plan" wideLayout>
				<SidebarNavigation />
				<DocumentHead title={ translate( 'My Plan' ) } />
				<QuerySites siteId={ selectedSiteId } />
				<QuerySitePlans siteId={ selectedSiteId } />
				{ shouldQuerySiteDomains && <QuerySiteDomains siteId={ selectedSiteId } /> }

				<PlansNavigation path={ path } />

				{ showDomainWarnings && (
					<DomainWarnings
						domains={ domains }
						position="current-plan"
						selectedSite={ selectedSite }
						ruleWhiteList={ [
							'newDomainsWithPrimary',
							'newDomains',
							'unverifiedDomainsCanManage',
							'pendingGSuiteTosAcceptanceDomains',
							'unverifiedDomainsCannotManage',
							'wrongNSMappedDomains',
							'newTransfersWrongNS',
						] }
					/>
				) }

				{ this.props.showThankYou ? (
					<CurrentPlanThankYouCard />
				) : (
					<CurrentPlanHeader
						isPlaceholder={ isLoading }
						title={ title }
						tagLine={ tagLine }
						currentPlan={ currentPlan }
						isExpiring={ isExpiring }
						siteSlug={ selectedSite ? selectedSite.slug : null }
					/>
				) }

				{ showJetpackChecklist && (
					<Fragment>
						<QueryJetpackPlugins siteIds={ [ selectedSiteId ] } />
						<JetpackChecklist />
					</Fragment>
				) }

				<div
					className={ classNames( 'current-plan__header-text current-plan__text', {
						'is-placeholder': { isLoading },
					} ) }
				>
					<h1 className="current-plan__header-heading">{ planFeaturesHeader }</h1>
				</div>
				<ProductPurchaseFeaturesList plan={ currentPlanSlug } isPlaceholder={ isLoading } />

				<TrackComponentView eventName={ 'calypso_plans_my_plan_view' } />
			</Main>
		);
	}
}

export default connect( ( state, { requestThankYou } ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const domains = getDecoratedSiteDomains( state, selectedSiteId );

	const isJetpack = isJetpackSite( state, selectedSiteId );
	const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

	const isJetpackNotAtomic = false === isAutomatedTransfer && isJetpack;

	return {
		selectedSite,
		selectedSiteId,
		domains,
		currentPlan: getCurrentPlan( state, selectedSiteId ),
		isExpiring: isCurrentPlanExpiring( state, selectedSiteId ),
		shouldShowDomainWarnings: ! isJetpack || isAutomatedTransfer,
		hasDomainsLoaded: !! domains,
		isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
		showJetpackChecklist: isJetpackNotAtomic && isEnabled( 'jetpack/checklist' ),
		showThankYou: requestThankYou && isJetpackNotAtomic && isEnabled( 'jetpack/checklist' ),
	};
} )( localize( CurrentPlan ) );
