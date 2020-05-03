/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, isEmpty } from 'lodash';

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
import { getSitePurchases } from 'state/purchases/selectors';
import { Button, Card } from '@automattic/components';
import MyPlanCard from './my-plan-card';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ProductExpiration from 'components/product-expiration';
import { withLocalizedMoment } from 'components/localized-moment';
import { managePurchase } from 'me/purchases/paths';
import { getPlan } from 'lib/plans';
import {
	isExpiring,
	isPartnerPurchase,
	shouldAddPaymentSourceInsteadOfRenewingNow,
} from 'lib/purchases';
import {
	isFreeJetpackPlan,
	isFreePlan,
	isJetpackProduct,
	getJetpackProductDisplayName,
	getJetpackProductTagline,
} from 'lib/products-values';

class PurchasesListing extends Component {
	static propTypes = {
		currentPlan: PropTypes.object,
		currentPlanSlug: PropTypes.string,
		isPlanExpiring: PropTypes.bool,
		isRequestingPlans: PropTypes.bool,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
		purchases: PropTypes.array,

		// From withLocalizedMoment() HoC
		moment: PropTypes.func.isRequired,

		// From localize() HoC
		translate: PropTypes.func.isRequired,
	};

	isLoading() {
		const { currentPlan, selectedSite, isRequestingPlans } = this.props;

		return ! currentPlan || ! selectedSite || isRequestingPlans;
	}

	isFreePlan( purchase ) {
		const { currentPlan } = this.props;

		if ( purchase && isJetpackProduct( purchase ) ) {
			return false;
		}

		return ! currentPlan || isFreePlan( currentPlan ) || isFreeJetpackPlan( currentPlan );
	}

	isProductExpiring( product ) {
		const { moment } = this.props;

		if ( ! product.expiryDate ) {
			return false;
		}

		return moment( product.expiryDate ) < moment().add( 30, 'days' );
	}

	getProductPurchases() {
		return (
			filter(
				this.props.purchases,
				( purchase ) => purchase.active && isJetpackProduct( purchase )
			) ?? null
		);
	}

	getTitle( purchase ) {
		const { currentPlanSlug } = this.props;

		if ( isJetpackProduct( purchase ) ) {
			return getJetpackProductDisplayName( purchase );
		}

		if ( currentPlanSlug ) {
			const planObject = getPlan( currentPlanSlug );
			return planObject.getTitle();
		}

		return null;
	}

	getTagline( purchase ) {
		const { currentPlanSlug, translate } = this.props;

		if ( isJetpackProduct( purchase ) ) {
			return getJetpackProductTagline( purchase );
		}

		const productPurchases = this.getProductPurchases();

		if ( currentPlanSlug ) {
			const planObject = getPlan( currentPlanSlug );
			return (
				planObject.getTagline?.( productPurchases[ 0 ]?.productSlug ) ??
				translate(
					'Unlock the full potential of your site with all the features included in your plan.'
				)
			);
		}

		return null;
	}

	getExpirationInfoForPlan( plan ) {
		// No expiration date for free plans.
		if ( this.isFreePlan( plan ) ) {
			return null;
		}

		const expiryMoment = plan.expiryDate ? this.props.moment( plan.expiryDate ) : null;

		const renewMoment =
			plan.autoRenew && plan.autoRenewDate ? this.props.moment( plan.autoRenewDate ) : null;

		return <ProductExpiration expiryDateMoment={ expiryMoment } renewDateMoment={ renewMoment } />;
	}

	getExpirationInfoForPurchase( purchase ) {
		// No expiration date for free plan or partner site.
		if ( this.isFreePlan( purchase ) || isPartnerPurchase( purchase ) ) {
			return null;
		}

		const expiryMoment = purchase.expiryDate ? this.props.moment( purchase.expiryDate ) : null;

		const renewMoment =
			! isExpiring( purchase ) && purchase.renewDate
				? this.props.moment( purchase.renewDate )
				: null;

		return <ProductExpiration expiryDateMoment={ expiryMoment } renewDateMoment={ renewMoment } />;
	}

	getActionButton( purchase ) {
		const { selectedSiteSlug, translate } = this.props;

		// No action button if there's no site selected or we're dealing with a partner site.
		if ( ! selectedSiteSlug || ! purchase || isPartnerPurchase( purchase ) ) {
			return null;
		}

		// For free plan show a button redirecting to the plans comparison.
		if ( this.isFreePlan( purchase ) ) {
			return (
				<Button href={ `/plans/${ selectedSiteSlug }` }>{ translate( 'Compare plans' ) }</Button>
			);
		}

		// If there's no purchase id, there's no manage purchase link so exit.
		if ( ! purchase.id ) {
			return null;
		}

		// For plans, show action button only to the site owners.
		if ( ! isJetpackProduct( purchase ) && ! purchase.userIsOwner ) {
			return null;
		}

		let label = translate( 'Manage plan' );

		if ( isJetpackProduct( purchase ) ) {
			label = translate( 'Manage product' );
		}

		if ( purchase.autoRenew && ! shouldAddPaymentSourceInsteadOfRenewingNow( purchase ) ) {
			label = translate( 'Renew now' );
		}

		return (
			<Button href={ managePurchase( selectedSiteSlug, purchase.id ) } compact>
				{ label }
			</Button>
		);
	}

	renderPlan() {
		const { currentPlan, currentPlanSlug, isPlanExpiring, translate } = this.props;

		return (
			<Fragment>
				<Card compact>
					<strong>{ translate( 'My Plan' ) }</strong>
				</Card>
				{ this.isLoading() ? (
					<MyPlanCard isPlaceholder />
				) : (
					<MyPlanCard
						action={ this.getActionButton( currentPlan ) }
						details={ this.getExpirationInfoForPlan( currentPlan ) }
						isError={ isPlanExpiring }
						product={ currentPlanSlug }
						tagline={ this.getTagline( currentPlan ) }
						title={ this.getTitle( currentPlan ) }
					/>
				) }
			</Fragment>
		);
	}

	renderProducts() {
		const { translate } = this.props;

		// Get all products and filter out falsy items.
		const productPurchases = this.getProductPurchases();

		if ( isEmpty( productPurchases ) ) {
			return null;
		}

		return (
			<Fragment>
				<Card compact>
					<strong>{ translate( 'My Solutions' ) }</strong>
				</Card>
				{ productPurchases.map( ( purchase ) => (
					<MyPlanCard
						key={ purchase.id }
						action={ this.getActionButton( purchase ) }
						details={ this.getExpirationInfoForPurchase( purchase ) }
						isError={ this.isProductExpiring( purchase ) }
						isPlaceholder={ this.isLoading() }
						product={ purchase?.productSlug }
						tagline={ this.getTagline( purchase ) }
						title={ this.getTitle( purchase ) }
					/>
				) ) }
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
				{ this.renderProducts() }
			</Fragment>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		currentPlan: getCurrentPlan( state, selectedSiteId ),
		currentPlanSlug: getSitePlanSlug( state, selectedSiteId ),
		isPlanExpiring: isCurrentPlanExpiring( state, selectedSiteId ),
		isRequestingPlans: isRequestingSitePlans( state, selectedSiteId ),
		purchases: getSitePurchases( state, selectedSiteId ),
		selectedSite: getSelectedSite( state ),
		selectedSiteId,
		selectedSiteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( withLocalizedMoment( PurchasesListing ) ) );
