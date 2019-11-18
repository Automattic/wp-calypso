/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, invoke } from 'lodash';

/**
 * Internal Dependencies
 */
import { Dialog } from '@automattic/components';
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
import Button from 'components/button';
import Card from 'components/card';
import MyPlanCard from './my-plan-card';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlan } from 'lib/plans';
import QuerySiteDomains from 'components/data/query-site-domains';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getDecoratedSiteDomains } from 'state/sites/domains/selectors';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isSiteOnFreePlan from 'state/selectors/is-site-on-free-plan';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import JetpackChecklist from 'my-sites/plans/current-plan/jetpack-checklist';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import PaidPlanThankYou from './current-plan-thank-you/paid-plan-thank-you';
import FreePlanThankYou from './current-plan-thank-you/free-plan-thank-you';
import BackupProductThankYou from './current-plan-thank-you/backup-thank-you';
import { getByPurchaseId } from 'state/purchases/selectors';
import { isPartnerPurchase, shouldAddPaymentSourceInsteadOfRenewingNow } from 'lib/purchases';
import { isFreeJetpackPlan, isFreePlan } from 'lib/products-values';
import { managePurchase } from 'me/purchases/paths';

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

	componentDidMount() {
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	}

	isLoading() {
		const { selectedSite, isRequestingSitePlans: isRequestingPlans } = this.props;

		return ! selectedSite || isRequestingPlans;
	}

	isFreePlan() {
		const { currentPlan } = this.props;

		return ! currentPlan || isFreePlan( currentPlan ) || isFreeJetpackPlan( currentPlan );
	}

	getPlanObject() {
		const { selectedSite } = this.props;
		const currentPlanSlug = get( selectedSite, 'plan.product_slug' );

		if ( ! currentPlanSlug ) {
			return null;
		}

		return getPlan( currentPlanSlug );
	}

	getActionButton() {
		const { currentPlan, purchase, selectedSite, translate } = this.props;
		const siteSlug = selectedSite ? selectedSite.slug : null;

		if ( ! currentPlan || ! siteSlug ) {
			return null;
		}

		// For free plan show a button redirecting to the plans comparison.
		if ( this.isFreePlan() ) {
			return <Button href={ `/plans/${ siteSlug }` }>{ translate( 'Compare Plans' ) }</Button>;
		}

		// Do not show the action button for partner plans.
		const isPartnerPlan = purchase && isPartnerPurchase( purchase );
		if ( isPartnerPlan ) {
			return null;
		}

		// Show action button only to site owners.
		if ( ! currentPlan.userIsOwner || ! currentPlan.id ) {
			return null;
		}

		const hasAutoRenew = !! currentPlan.autoRenew;
		let label = translate( 'Manage Plan' );
		if (
			! hasAutoRenew &&
			! shouldAddPaymentSourceInsteadOfRenewingNow( currentPlan.expiryMoment )
		) {
			label = translate( 'Renew Now' );
		}

		return (
			<Button href={ managePurchase( siteSlug, currentPlan.id ) } compact>
				{ label }
			</Button>
		);
	}

	getPlanExpiration() {
		const { currentPlan, purchase, translate } = this.props;
		const isPartnerPlan = purchase && isPartnerPurchase( purchase );

		if ( this.isFreePlan() || isPartnerPlan ) {
			return null;
		}

		const hasAutoRenew = !! currentPlan.autoRenew;
		if ( hasAutoRenew && currentPlan.autoRenewDateMoment ) {
			return translate( 'Set to auto-renew on %s.', {
				args: invoke( currentPlan, 'autoRenewDateMoment.format', 'LL' ),
			} );
		}

		return translate( 'Expires on %s.', {
			args: invoke( currentPlan, 'expiryMoment.format', 'LL' ),
		} );
	}

	getPlanTitle() {
		const planObject = this.getPlanObject();

		if ( planObject.getTitle ) {
			return planObject.getTitle();
		}

		return null;
	}

	getPlanTagLine() {
		const { translate } = this.props;
		const planObject = this.getPlanObject();

		if ( planObject.getTagline ) {
			return planObject.getTagline();
		}

		return translate(
			'Unlock the full potential of your site with all the features included in your plan.'
		);
	}

	renderPlan() {
		const { isExpiring, selectedSite, translate } = this.props;
		const currentPlanSlug = get( selectedSite, 'plan.product_slug' );

		return (
			<Fragment>
				<Card compact>
					<strong>{ translate( 'My Plan' ) }</strong>
				</Card>
				<MyPlanCard
					action={ this.getActionButton() }
					details={ this.getPlanExpiration() }
					isError={ isExpiring }
					isPlaceholder={ this.isLoading() }
					plan={ currentPlanSlug }
					title={ this.getPlanTitle() }
					tagLine={ this.getPlanTagLine() }
				/>
			</Fragment>
		);
	}

	renderThankYou() {
		const { requestProduct } = this.props;

		if ( requestProduct ) {
			return <BackupProductThankYou />;
		}
		if ( this.isFreePlan() ) {
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

				{ this.renderPlan() }

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

export default connect( ( state, { requestThankYou, requestProduct } ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const domains = getDecoratedSiteDomains( state, selectedSiteId );

	const isJetpack = isJetpackSite( state, selectedSiteId );
	const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

	const isJetpackNotAtomic = false === isAutomatedTransfer && isJetpack;

	const currentPlan = getCurrentPlan( state, selectedSiteId );

	return {
		selectedSite,
		selectedSiteId,
		domains,
		currentPlan: currentPlan,
		isExpiring: isCurrentPlanExpiring( state, selectedSiteId ),
		isFreePlan: isSiteOnFreePlan( state, selectedSiteId ),
		shouldShowDomainWarnings: ! isJetpack || isAutomatedTransfer,
		hasDomainsLoaded: !! domains,
		isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
		purchase: currentPlan ? getByPurchaseId( state, currentPlan.id ) : null,
		showJetpackChecklist: isJetpackNotAtomic,
		showThankYou: requestThankYou && isJetpackNotAtomic,
		requestProduct,
	};
} )( localize( CurrentPlan ) );
