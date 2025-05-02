import {
	PLAN_PERSONAL,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM_3_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	getFeatureDifference,
	getPlan,
	getFeatureByKey,
	FeatureObject,
	WPComPlan,
	WPCOM_FEATURES_ATOMIC,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Card, Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useMemo } from 'react';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HeaderCake from 'calypso/components/header-cake';
import { hasAmountAvailableToRefund, isRefundable } from 'calypso/lib/purchases';
import { cancelAndRefundPurchaseAsync } from 'calypso/lib/purchases/actions';
import { Purchase } from 'calypso/lib/purchases/types';
import { managePurchase } from 'calypso/me/purchases/paths';
import PurchaseSiteHeader from 'calypso/me/purchases/purchases-site/header';
import titles from 'calypso/me/purchases/titles';
import { isDataLoading } from 'calypso/me/purchases/utils';
import { getPurchaseListUrlFor } from 'calypso/my-sites/purchases/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { clearPurchases } from 'calypso/state/purchases/actions';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import SupportLink from '../cancel-purchase-support-link/support-link';
import { AtomicWarning } from './atomic-warning';
import DowngradeLoadingPlaceholder from './downgrade-placeholder';

import './style.scss';

interface DowngradeProps {
	siteSlug: string;
	purchaseId: number;
	getManagePurchaseUrlFor: ( siteSlug: string, purchaseId: number ) => string;
}

const DowngradeFeatureList: React.FC< { features: FeatureObject[]; purchase: Purchase } > = ( {
	features,
} ) => {
	if ( ! features.length ) {
		return null;
	}

	return (
		<div className="downgrade__features">
			<ul className="downgrade__features-list">
				{ features.map( ( feature, idx ) => (
					<li key={ idx }>
						<Gridicon
							className="downgrade__refund-information--item-cross-small"
							size={ 24 }
							icon="cross-small"
						/>
						<span>{ feature.getTitle() }</span>
					</li>
				) ) }
			</ul>
		</div>
	);
};

const downgradePath: Record< string, string > = {
	// Annual plans
	[ PLAN_PREMIUM ]: PLAN_PERSONAL,
	[ PLAN_BUSINESS ]: PLAN_PREMIUM,
	[ PLAN_ECOMMERCE ]: PLAN_BUSINESS,

	// Monthly plans
	[ PLAN_PREMIUM_MONTHLY ]: PLAN_PERSONAL_MONTHLY,
	[ PLAN_BUSINESS_MONTHLY ]: PLAN_PREMIUM_MONTHLY,
	[ PLAN_ECOMMERCE_MONTHLY ]: PLAN_BUSINESS_MONTHLY,

	// 2-year plans
	[ PLAN_PREMIUM_2_YEARS ]: PLAN_PERSONAL_2_YEARS,
	[ PLAN_BUSINESS_2_YEARS ]: PLAN_PREMIUM_2_YEARS,
	[ PLAN_ECOMMERCE_2_YEARS ]: PLAN_BUSINESS_2_YEARS,

	// 3-year plans
	[ PLAN_PREMIUM_3_YEARS ]: PLAN_PERSONAL_3_YEARS,
	[ PLAN_BUSINESS_3_YEARS ]: PLAN_PREMIUM_3_YEARS,
	[ PLAN_ECOMMERCE_3_YEARS ]: PLAN_BUSINESS_3_YEARS,
};

export const Downgrade: React.FC< DowngradeProps > = ( props ) => {
	const { siteSlug, purchaseId, getManagePurchaseUrlFor = managePurchase } = props;
	const [ isAtomicWarningVisible, setIsAtomicWarningVisible ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const purchase = useSelector( ( state ) => getByPurchaseId( state, purchaseId ) );

	const hasLoadedSites = useSelector( ( state ) => ! isRequestingSites( state ) );
	const [ isDowngrading, setIsDowngrading ] = useState( false );
	const loadedFromServer = useSelector( hasLoadedUserPurchasesFromServer );
	const site = useSelector( ( state ) => getSite( state, siteSlug ) ) ?? ( {} as any );
	const { ID: siteId, name: siteName } = site;
	const isAtomicSite = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const targetPlan = getPlan( downgradePath[ purchase?.productSlug ?? '' ] );
	const currentPlan = getPlan( purchase?.productSlug ?? '' );
	const featureSlugs = getFeatureDifference(
		downgradePath[ purchase?.productSlug ?? '' ],
		purchase?.productSlug ?? '',
		'getCancellationFeatures'
	);
	const features = featureSlugs.map( ( slug ) => getFeatureByKey( slug ) );
	const isAtomicSiteDowngrade =
		isAtomicSite && ! targetPlan?.getIncludedFeatures?.().includes( WPCOM_FEATURES_ATOMIC );

	const refundAmount = useMemo( () => {
		if ( ! purchase ) {
			return '0';
		}

		const { refundOptions, currencyCode } = purchase;
		const defaultFormatter = new Intl.NumberFormat( 'en-US', {
			style: 'currency',
			currency: currencyCode,
		} );
		const precision = defaultFormatter.resolvedOptions().maximumFractionDigits;
		const matchingRefundOption =
			isRefundable( purchase ) && Array.isArray( refundOptions )
				? refundOptions.find( ( option ) => option.to_product_id === targetPlan?.getProductId() )
				: null;
		const refundAmount = matchingRefundOption?.refund_amount ?? 0;

		return parseFloat( refundAmount ).toFixed( precision );
	}, [ purchase, targetPlan ] );

	if (
		isDataLoading( { hasLoadedSites, hasLoadedUserPurchasesFromServer: loadedFromServer } ) ||
		! purchase
	) {
		return (
			<>
				<QueryUserPurchases />
				<DowngradeLoadingPlaceholder siteId={ siteId! } name={ siteName! } purchase={ purchase! } />
			</>
		);
	}
	const purchaseRoot = getManagePurchaseUrlFor( siteSlug, purchaseId );

	const handleDowngrade = async ( enableLosslessRevert: boolean ) => {
		if (
			! purchaseId ||
			! currentPlan?.getProductId() ||
			! targetPlan?.getStoreSlug() ||
			isDowngrading
		) {
			return;
		}

		setIsDowngrading( true );

		try {
			const response = await cancelAndRefundPurchaseAsync( purchaseId, {
				product_id: currentPlan.getProductId(),
				type: 'downgrade',
				to_product_id: targetPlan.getProductId(),
				lossless_revert: enableLosslessRevert,
			} );
			await Promise.all( [
				dispatch( refreshSitePlans( siteId! ) ),
				dispatch( clearPurchases() ),
			] );

			dispatch( successNotice( response.message, { duration: 5000 } ) );

			// Wait for the notice to be displayed
			await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );

			const finalSiteSlug = isAtomicSiteDowngrade
				? siteSlug.replace( 'wpcomstaging', 'wordpress' )
				: siteSlug;
			window.location.href = getPurchaseListUrlFor( finalSiteSlug );

			// Show success notification after data is refreshed
		} catch ( error: unknown ) {
			if ( error instanceof Error ) {
				dispatch( errorNotice( error.message, { duration: 5000 } ) );
			} else {
				dispatch( errorNotice( translate( 'An unknown error occurred' ), { duration: 5000 } ) );
			}
		} finally {
			setIsDowngrading( false );
		}
	};

	const checkAtomicAndDowngrade = () => {
		if ( isAtomicSiteDowngrade ) {
			setIsAtomicWarningVisible( true );
		} else {
			handleDowngrade( false );
		}
	};

	const getDowngradeMessage = () => {
		const hasRefund = hasAmountAvailableToRefund( purchase ) && purchase?.mostRecentRenewDate;
		const basePlanArgs = {
			currentPlan: currentPlan?.getTitle() ?? '',
			targetPlan: targetPlan?.getTitle() ?? '',
		};

		return hasRefund
			? translate(
					"When you downgrade from %(currentPlan)s to %(targetPlan)s, we'll process a refund of %(amount)s to your original payment method.",
					{
						args: {
							...basePlanArgs,
							amount: formatCurrency( parseFloat( refundAmount ), purchase.currencyCode ),
						},
					}
			  )
			: translate( 'We will change the plan immediately from %(currentPlan)s to %(targetPlan)s.', {
					args: basePlanArgs,
			  } );
	};

	if ( isAtomicWarningVisible ) {
		return (
			<AtomicWarning
				purchaseRoot={ purchaseRoot }
				currentPlan={ currentPlan as WPComPlan }
				purchase={ purchase }
				site={ site }
				closeDialog={ () => setIsAtomicWarningVisible( false ) }
				handleDowngrade={ handleDowngrade }
				targetPlanName={ targetPlan?.getTitle() ?? '' }
				isDowngrading={ isDowngrading }
				siteSlug={ siteSlug }
			/>
		);
	}

	return (
		<>
			<HeaderCake backHref={ purchaseRoot }>
				{ titles.downgradeSubscription( currentPlan?.getTitle() ) }
			</HeaderCake>
			<PurchaseSiteHeader siteId={ siteId } name={ siteName } purchase={ purchase } />
			<Card className="downgrade__wrapper-card">
				<div className="downgrade__inner-wrapper">
					<div className="downgrade__content">
						<div>
							<strong>{ getDowngradeMessage() }</strong>
						</div>

						{ features.length > 0 && (
							<div>
								{ translate(
									'These features will no longer be available on your site when your plan changes:'
								) }
							</div>
						) }
					</div>
					<DowngradeFeatureList features={ features } purchase={ purchase } />

					<div className="downgrade__confirm-buttons">
						<Button variant="primary" isBusy={ isDowngrading } onClick={ checkAtomicAndDowngrade }>
							{ translate( 'Downgrade to %(targetPlan)s', {
								args: { targetPlan: targetPlan?.getTitle() ?? '' },
							} ) }
						</Button>
						<Button
							variant="secondary"
							disabled={ isDowngrading }
							onClick={ () => page( getManagePurchaseUrlFor( siteSlug, purchaseId ) ) }
						>
							{ translate( 'Keep %(currentPlan)s', {
								args: { currentPlan: currentPlan?.getTitle() ?? '' },
							} ) }
						</Button>
					</div>
					<SupportLink usage="downgrade" purchase={ purchase } />
				</div>
			</Card>
		</>
	);
};
