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
import isJetpackCloudEligible from 'state/selectors/is-jetpack-cloud-eligible';
import { Button, Card } from '@automattic/components';
import MyPlanCard from './my-plan-card';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ProductExpiration from 'components/product-expiration';
import { withLocalizedMoment } from 'components/localized-moment';
import { managePurchase } from 'me/purchases/paths';
import { getPlan, planHasFeature } from 'lib/plans';
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
	isJetpackBackup,
	isJetpackScan,
} from 'lib/products-values';
import {
	isJetpackSearch,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_BACKUP_REALTIME,
} from 'lib/products-values/constants';
import Gridicon from 'components/gridicon';
import QueryRewindState from 'components/data/query-rewind-state';

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
		const { currentPlan, selectedSite, isRequestingPlans, isCloudEligible } = this.props;

		return ! currentPlan || ! selectedSite || isRequestingPlans || undefined === isCloudEligible;
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
				( purchase ) =>
					purchase.active && ( isJetpackProduct( purchase ) || isJetpackSearch( purchase ) )
			) ?? null
		);
	}

	getTitle( purchase ) {
		const { currentPlanSlug } = this.props;

		if ( isJetpackSearch( purchase.productSlug ) ) {
			return getJetpackProductDisplayName( purchase );
		}

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

		if ( isJetpackSearch( purchase ) ) {
			return getJetpackProductTagline( 'search' );
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

		// No action button if there's no site selected.
		if ( ! selectedSiteSlug || ! purchase ) {
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
			label = translate( 'Manage subscription' );
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

	getPlanActionButtons( plan ) {
		const { translate, selectedSiteSlug: site } = this.props;

		// Determine if the plan contains Backup or Scan.
		let serviceButtonText = null;

		// The function planHasFeature does not check inferior features.
		const planHasBackup =
			planHasFeature( plan.productSlug, PRODUCT_JETPACK_BACKUP_DAILY ) ||
			planHasFeature( plan.productSlug, PRODUCT_JETPACK_BACKUP_REALTIME );
		const planHasScan = planHasFeature( plan.productSlug, PRODUCT_JETPACK_SCAN );

		if ( planHasBackup && planHasScan ) {
			serviceButtonText = translate( 'View Backup & Scan' );
		} else if ( planHasBackup ) {
			serviceButtonText = translate( 'View Backup' );
		} else if ( planHasScan ) {
			serviceButtonText = translate( 'View Scan' );
		}

		let serviceButton = null;
		if ( serviceButtonText ) {
			// Scan threats always show regardless of filter, so they'll display as well.
			serviceButton = (
				<Button href={ `/activity-log/${ site }?group=rewind` } compact>
					{ serviceButtonText }
				</Button>
			);
		}

		return (
			<>
				{ this.getActionButton( plan ) }
				{ serviceButton }
			</>
		);
	}

	getProductActionButtons( purchase ) {
		const { translate, selectedSiteSlug: site, isCloudEligible } = this.props;
		const actionButton = this.getActionButton( purchase );

		const maybeExternalIcon = isCloudEligible && (
			<>
				&nbsp;
				<Gridicon icon="external" />
			</>
		);

		let serviceButton = null;
		if ( isJetpackBackup( purchase ) ) {
			const target = isCloudEligible
				? `https://cloud.jetpack.com/backup/${ site }`
				: `/activity-log/${ site }?group=rewind`;
			serviceButton = (
				<Button href={ target } compact>
					{ translate( 'View backups' ) }
					{ maybeExternalIcon }
				</Button>
			);
		} else if ( isJetpackScan( purchase ) ) {
			const target = isCloudEligible
				? `https://cloud.jetpack.com/scan/${ site }`
				: `/activity-log/${ site }`;
			serviceButton = (
				<Button href={ target } compact>
					{ translate( 'View scan results' ) }
					{ maybeExternalIcon }
				</Button>
			);
		}

		return (
			<>
				{ actionButton }
				{ serviceButton }
			</>
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
						action={ this.getPlanActionButtons( currentPlan ) }
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
						action={ this.getProductActionButtons( purchase ) }
						details={ this.getExpirationInfoForPurchase( purchase ) }
						isError={ this.isProductExpiring( purchase ) }
						isPlaceholder={ this.isLoading() }
						product={ purchase.productSlug }
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
				<QueryRewindState siteId={ selectedSiteId } />

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
		isCloudEligible: isJetpackCloudEligible( state, selectedSiteId ),
	};
} )( localize( withLocalizedMoment( PurchasesListing ) ) );
