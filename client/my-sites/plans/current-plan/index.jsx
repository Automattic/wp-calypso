/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { startsWith } from 'lodash';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import AsyncLoad from 'components/async-load';
import { Dialog } from '@automattic/components';
import Main from 'components/main';
import { getCurrentPlan, isRequestingSitePlans } from 'state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import DocumentHead from 'components/data/document-head';
import TrackComponentView from 'lib/analytics/track-component-view';
import PlansNavigation from 'my-sites/plans/navigation';
import PurchasesListing from './purchases-listing';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlan } from 'lib/plans';
import QuerySiteDomains from 'components/data/query-site-domains';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import JetpackChecklist from 'my-sites/plans/current-plan/jetpack-checklist';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import PaidPlanThankYou from './current-plan-thank-you/paid-plan-thank-you';
import FreePlanThankYou from './current-plan-thank-you/free-plan-thank-you';
import BackupProductThankYou from './current-plan-thank-you/backup-thank-you';
import ScanProductThankYou from './current-plan-thank-you/scan-thank-you';
import SearchProductThankYou from './current-plan-thank-you/search-thank-you';
import { isFreeJetpackPlan, isFreePlan } from 'lib/products-values';

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
		plan: PropTypes.string,
		product: PropTypes.string,
		requestThankYou: PropTypes.bool,
		shouldShowDomainWarnings: PropTypes.bool,
		hasDomainsLoaded: PropTypes.bool,
		showJetpackChecklist: PropTypes.bool,
		showThankYou: PropTypes.bool,

		// From localize() HoC
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	}

	isLoading() {
		const { selectedSite, isRequestingSitePlans: isRequestingPlans } = this.props;

		return ! selectedSite || isRequestingPlans;
	}

	renderThankYou() {
		const { currentPlan, product } = this.props;

		if ( startsWith( product, 'jetpack_backup' ) ) {
			return <BackupProductThankYou />;
		}

		if ( startsWith( product, 'jetpack_scan' ) ) {
			return <ScanProductThankYou />;
		}

		if ( startsWith( product, 'jetpack_search' ) ) {
			return <SearchProductThankYou />;
		}

		if ( ! currentPlan || isFreePlan( currentPlan ) || isFreeJetpackPlan( currentPlan ) ) {
			return <FreePlanThankYou />;
		}

		return <PaidPlanThankYou />;
	}

	render() {
		const {
			domains,
			hasDomainsLoaded,
			path,
			selectedSite,
			selectedSiteId,
			shouldShowDomainWarnings,
			showJetpackChecklist,
			showThankYou,
			translate,
		} = this.props;

		const currentPlanSlug = selectedSite.plan.product_slug,
			isLoading = this.isLoading();

		const planConstObj = getPlan( currentPlanSlug ),
			planFeaturesHeader = translate( '%(planName)s plan features', {
				args: { planName: planConstObj.getTitle() },
			} );

		const shouldQuerySiteDomains = selectedSiteId && shouldShowDomainWarnings;
		const showDomainWarnings = hasDomainsLoaded && shouldShowDomainWarnings;
		return (
			<Main className="current-plan" wideLayout>
				<SidebarNavigation />
				<DocumentHead title={ translate( 'My Plan' ) } />
				<FormattedHeader
					className="current-plan__page-heading"
					headerText={ translate( 'Plans' ) }
					align="left"
				/>
				<QuerySites siteId={ selectedSiteId } />
				<QuerySitePlans siteId={ selectedSiteId } />
				<QuerySitePurchases siteId={ selectedSiteId } />
				{ shouldQuerySiteDomains && <QuerySiteDomains siteId={ selectedSiteId } /> }

				<Dialog
					baseClassName="current-plan__dialog dialog__content dialog__backdrop"
					isVisible={ showThankYou }
				>
					{ this.renderThankYou() }
				</Dialog>

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

				<PurchasesListing />

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

				<AsyncLoad
					require="blocks/product-purchase-features-list"
					placeholder={ null }
					plan={ currentPlanSlug }
					isPlaceholder={ isLoading }
				/>

				<TrackComponentView eventName={ 'calypso_plans_my_plan_view' } />
			</Main>
		);
	}
}

export default connect( ( state, { requestThankYou } ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const domains = getDomainsBySiteId( state, selectedSiteId );

	const isJetpack = isJetpackSite( state, selectedSiteId );
	const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

	const isJetpackNotAtomic = false === isAutomatedTransfer && isJetpack;

	const currentPlan = getCurrentPlan( state, selectedSiteId );

	return {
		currentPlan,
		domains,
		hasDomainsLoaded: !! domains,
		isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
		selectedSite,
		selectedSiteId,
		shouldShowDomainWarnings: ! isJetpack || isAutomatedTransfer,
		showJetpackChecklist: isJetpackNotAtomic,
		showThankYou: requestThankYou && isJetpackNotAtomic,
	};
} )( localize( CurrentPlan ) );
