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
} from '@automattic/calypso-products';
import { Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import FormButton from 'calypso/components/forms/form-button';
import HeaderCake from 'calypso/components/header-cake';
import { Purchase } from 'calypso/lib/purchases/types';
import PurchaseSiteHeader from 'calypso/me/purchases/purchases-site/header';
import titles from 'calypso/me/purchases/titles';
import { isDataLoading } from 'calypso/me/purchases/utils';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { useSelector } from 'calypso/state';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import SupportLink from '../cancel-purchase-support-link/support-link';
import DowngradeLoadingPlaceholder from './downgrade-placeholder';

import './style.scss';

interface DowngradeProps {
	siteSlug: string;
	purchaseId: number;
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
	const { siteSlug, purchaseId } = props;
	const translate = useTranslate();
	const purchase = useSelector( ( state ) => getByPurchaseId( state, purchaseId ) );
	const hasLoadedSites = useSelector( ( state ) => ! isRequestingSites( state ) );
	const loadedFromServer = useSelector( hasLoadedUserPurchasesFromServer );
	const { ID: siteId, name: siteName } =
		useSelector( ( state ) => getSite( state, siteSlug ) ) ?? {};

	const targetPlan = getPlan( downgradePath[ purchase?.productSlug ?? '' ] );
	const currentPlan = getPlan( purchase?.productSlug ?? '' );
	const featureSlugs = getFeatureDifference(
		downgradePath[ purchase?.productSlug ?? '' ],
		purchase?.productSlug ?? '',
		'getCheckoutFeatures'
	);
	const features = featureSlugs.map( ( slug ) => getFeatureByKey( slug ) );

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
							<strong>
								{ translate(
									'We will change the plan immediately and pro-rate the remaining value from %(currentPlan)s to %(targetPlan)s.',
									{
										args: {
											currentPlan: currentPlan?.getTitle() ?? '',
											targetPlan: targetPlan?.getTitle() ?? '',
										},
									}
								) }
							</strong>
						</div>

						<div>
							{ translate(
								'These features will no longer be available on your site when your plan changes:'
							) }
						</div>
					</div>
					<DowngradeFeatureList features={ features } purchase={ purchase } />

					<div className="downgrade__confirm-buttons">
						<FormButton
							primary
							onClick={ () => {
								alert( 'Downgrade not implemented' );
							} }
						>
							{ translate( 'Downgrade to %(targetPlan)s', {
								args: { targetPlan: targetPlan?.getTitle() ?? '' },
							} ) }
						</FormButton>
						<FormButton
							isPrimary={ false }
							href={ getManagePurchaseUrlFor( siteSlug, purchaseId ) }
						>
							{ translate( 'Keep %(currentPlan)s', {
								args: { currentPlan: currentPlan?.getTitle() ?? '' },
							} ) }
						</FormButton>
					</div>
					<SupportLink usage="downgrade" purchase={ purchase } />
				</div>
			</Card>
		</>
	);
};
