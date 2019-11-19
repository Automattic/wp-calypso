/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { invoke } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getCurrentPlan,
	getSitePlanSlug,
	isCurrentPlanExpiring,
	isRequestingSitePlans,
} from 'state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Button from 'components/button';
import Card from 'components/card';
import MyPlanCard from './my-plan-card';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getPlan } from 'lib/plans';
import { getByPurchaseId } from 'state/purchases/selectors';
import { isPartnerPurchase, shouldAddPaymentSourceInsteadOfRenewingNow } from 'lib/purchases';
import { isFreeJetpackPlan, isFreePlan } from 'lib/products-values';
import { managePurchase } from 'me/purchases/paths';

class PurchasesListing extends Component {
	static propTypes = {
		currentPlan: PropTypes.object,
		currentPlanSlug: PropTypes.string,
		isPlanExpiring: PropTypes.bool,
		isRequestingSitePlans: PropTypes.bool,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
		purchase: PropTypes.object,

		// From localize() HoC
		translate: PropTypes.func.isRequired,
	};

	isLoading() {
		const { currentPlanSlug, selectedSite, isRequestingSitePlans: isRequestingPlans } = this.props;

		return ! currentPlanSlug || ! selectedSite || isRequestingPlans;
	}

	isFreePlan() {
		const { currentPlan } = this.props;

		return ! currentPlan || isFreePlan( currentPlan ) || isFreeJetpackPlan( currentPlan );
	}

	getPlanObject() {
		const { currentPlanSlug } = this.props;

		if ( ! currentPlanSlug ) {
			return null;
		}

		return getPlan( currentPlanSlug );
	}

	getActionButton() {
		const { currentPlan, purchase, selectedSiteSlug, translate } = this.props;

		if ( ! currentPlan || ! selectedSiteSlug ) {
			return null;
		}

		// For free plan show a button redirecting to the plans comparison.
		if ( this.isFreePlan() ) {
			return (
				<Button href={ `/plans/${ selectedSiteSlug }` }>{ translate( 'Compare Plans' ) }</Button>
			);
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
			<Button href={ managePurchase( selectedSiteSlug, currentPlan.id ) } compact>
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

		return planObject?.getTitle?.();
	}

	getPlanTagLine() {
		const { translate } = this.props;
		const planObject = this.getPlanObject();

		return (
			planObject?.getTagline?.() ??
			translate(
				'Unlock the full potential of your site with all the features included in your plan.'
			)
		);
	}

	renderPlan() {
		const { currentPlanSlug, isPlanExpiring, translate } = this.props;

		return (
			<Fragment>
				<Card compact>
					<strong>{ translate( 'My Plan' ) }</strong>
				</Card>
				<MyPlanCard
					action={ this.getActionButton() }
					details={ this.getPlanExpiration() }
					isError={ isPlanExpiring }
					isPlaceholder={ this.isLoading() }
					plan={ currentPlanSlug }
					title={ this.getPlanTitle() }
					tagLine={ this.getPlanTagLine() }
				/>
			</Fragment>
		);
	}

	render() {
		const { selectedSiteId } = this.props;

		return (
			<Fragment>
				<QuerySites siteId={ selectedSiteId } />
				<QuerySitePlans siteId={ selectedSiteId } />
				<QuerySitePurchases siteId={ selectedSiteId } />
				{ this.renderPlan() }
			</Fragment>
		);
	}
}

export default connect( state => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const currentPlan = getCurrentPlan( state, selectedSiteId );

	return {
		currentPlan,
		currentPlanSlug: getSitePlanSlug( state, selectedSiteId ),
		isPlanExpiring: isCurrentPlanExpiring( state, selectedSiteId ),
		isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
		purchase: currentPlan ? getByPurchaseId( state, currentPlan.id ) : null,
		selectedSite,
		selectedSiteId,
		selectedSiteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( PurchasesListing ) );
