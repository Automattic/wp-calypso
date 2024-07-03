import {
	isFreeJetpackPlan,
	isFreePlan,
	isJetpackProduct,
	getJetpackProductDisplayName,
	getJetpackProductTagline,
	isJetpackBackup,
	isJetpackScan,
	getPlan,
	isPlan,
	planHasFeature,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BACKUP_ADDON_PRODUCTS,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { Button, Card, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import BackupStorageSpace from 'calypso/components/backup-storage-space';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QuerySites from 'calypso/components/data/query-sites';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import ProductExpiration from 'calypso/components/product-expiration';
import {
	isExpiring,
	isPartnerPurchase,
	shouldAddPaymentSourceInsteadOfRenewingNow,
} from 'calypso/lib/purchases';
import { managePurchase } from 'calypso/me/purchases/paths';
import OwnerInfo from 'calypso/me/purchases/purchase-item/owner-info';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import isJetpackCloudEligible from 'calypso/state/selectors/is-jetpack-cloud-eligible';
import {
	getCurrentPlan,
	isCurrentPlanExpiring,
	isRequestingSitePlans,
} from 'calypso/state/sites/plans/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import MyPlanCard from './my-plan-card';

class PurchasesListing extends Component {
	static propTypes = {
		getManagePurchaseUrlFor: PropTypes.func,
		currentPlan: PropTypes.object,
		isPlanExpiring: PropTypes.bool,
		isRequestingPlans: PropTypes.bool,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
		purchases: PropTypes.array,
		currentUserId: PropTypes.number,

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
			this.props.purchases?.filter(
				( purchase ) => purchase.active && isJetpackProduct( purchase )
			) ?? []
		);
	}

	getTitle( purchase ) {
		const { currentPlan, translate } = this.props;

		if ( isJetpackProduct( purchase ) ) {
			return getJetpackProductDisplayName( purchase );
		}

		if ( currentPlan ) {
			const planObject = getPlan( currentPlan.productSlug );
			if ( planObject.term === TERM_MONTHLY ) {
				return (
					<>
						{ planObject.getTitle() } { translate( 'monthly' ) }
					</>
				);
			}
			return planObject.getTitle();
		}

		return null;
	}

	getPlanTagline( plan ) {
		const { translate } = this.props;

		if ( plan ) {
			const productPurchases = this.getProductPurchases().map( ( { productSlug } ) => productSlug );
			const planObject = getPlan( plan.productSlug );
			return (
				planObject.getTagline?.( productPurchases ) ??
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
		const { selectedSiteSlug, translate, currentUserId } = this.props;

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

		const isLocked = this.props.purchases.some( ( p ) => p.id === purchase.id && p.isLocked );

		if (
			purchase.autoRenew &&
			! shouldAddPaymentSourceInsteadOfRenewingNow( purchase ) &&
			! isLocked
		) {
			label = translate( 'Renew now' );
		}

		const userIsPurchaseOwner =
			purchase?.userIsOwner || ( currentUserId !== null && currentUserId === purchase?.userId );

		return (
			<Button
				href={
					// Reason for making it '#' is to ensure that it gets rendered as <a /> and not as <button />
					// If it's rendered as <button />, `OwnerInfo` uses `InfoPopover` and that also renders a button
					// we can't render <button /> inside another <button />
					userIsPurchaseOwner
						? this.props.getManagePurchaseUrlFor( selectedSiteSlug, purchase.id )
						: '#'
				}
				disabled={ ! userIsPurchaseOwner }
				compact
			>
				{ label }
				&nbsp;
				<OwnerInfo purchase={ purchase } />
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
			serviceButtonText = translate( 'View VaultPress Backup & Scan' );
		} else if ( planHasBackup ) {
			serviceButtonText = translate( 'View VaultPress Backup' );
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

	getHeaderChildren( purchase ) {
		const includesBackup =
			isJetpackBackup( purchase ) ||
			( isPlan( purchase ) &&
				JETPACK_BACKUP_PRODUCTS.some( ( feature ) =>
					planHasFeature( purchase.productSlug, feature )
				) );

		// Only Backup-inclusive products and plans have this section for now
		if ( ! includesBackup ) {
			return null;
		}

		return <BackupStorageSpace />;
	}

	renderPlan() {
		const { currentPlan, isPlanExpiring, translate } = this.props;

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
						product={ currentPlan.productSlug }
						tagline={ this.getPlanTagline( currentPlan ) }
						title={ this.getTitle( currentPlan ) }
						headerChildren={ this.getHeaderChildren( currentPlan ) }
					/>
				) }
			</Fragment>
		);
	}

	sortBackupProducts( products ) {
		//create a new array with the backup products first then the add-ons
		let backupIndex = -1;
		const backupSortedArray = [];
		const addOnProducts = [];
		products.forEach( ( product ) => {
			if ( JETPACK_BACKUP_ADDON_PRODUCTS.includes( product.productSlug ) ) {
				if ( backupIndex === -1 ) {
					addOnProducts.push( product );
				} else {
					backupSortedArray.splice( backupIndex + 1, 0, product );
				}
			} else if ( JETPACK_BACKUP_PRODUCTS.includes( product.productSlug ) ) {
				backupSortedArray.push( product );
				backupIndex = backupSortedArray.length - 1;
				if ( addOnProducts.length ) {
					backupSortedArray.push( ...addOnProducts );
				}
			} else {
				backupSortedArray.push( product );
			}
		} );
		return backupSortedArray;
	}

	renderProducts() {
		const { translate } = this.props;

		// Get all products and filter out falsy items.
		let productPurchases = this.getProductPurchases();
		if ( productPurchases.length === 0 ) {
			return null;
		}

		productPurchases = this.sortBackupProducts( productPurchases );

		return (
			<Fragment>
				<Card compact>
					<strong>{ translate( 'My Solutions' ) }</strong>
				</Card>
				{ productPurchases.map( ( purchase ) =>
					this.isLoading() ? (
						<MyPlanCard isPlaceholder key={ purchase.id } />
					) : (
						<MyPlanCard
							key={ purchase.id }
							action={ this.getProductActionButtons( purchase ) }
							details={ this.getExpirationInfoForPurchase( purchase ) }
							isError={ this.isProductExpiring( purchase ) }
							product={ purchase.productSlug }
							tagline={ getJetpackProductTagline( { product_slug: purchase.productSlug }, true ) }
							title={ this.getTitle( purchase ) }
							headerChildren={ this.getHeaderChildren( purchase ) }
						/>
					)
				) }
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
		getManagePurchaseUrlFor: selectedSiteId ? getManagePurchaseUrlFor : managePurchase,
		currentPlan: getCurrentPlan( state, selectedSiteId ),
		isPlanExpiring: isCurrentPlanExpiring( state, selectedSiteId ),
		isRequestingPlans: isRequestingSitePlans( state, selectedSiteId ),
		purchases: getSitePurchases( state, selectedSiteId ),
		selectedSite: getSelectedSite( state ),
		selectedSiteId,
		selectedSiteSlug: getSelectedSiteSlug( state ),
		isCloudEligible: isJetpackCloudEligible( state, selectedSiteId ),
		currentUserId: getCurrentUserId( state ),
	};
} )( localize( withLocalizedMoment( PurchasesListing ) ) );
