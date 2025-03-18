import {
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	getFeatureDifference,
	getPlan,
	getFeatureByKey,
	FeatureObject,
} from '@automattic/calypso-products';
import { Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import FormButton from 'calypso/components/forms/form-button';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { getName } from 'calypso/lib/purchases';
import { Purchase } from 'calypso/lib/purchases/types';
import PurchaseSiteHeader from 'calypso/me/purchases/purchases-site/header';
import { isDataLoading } from 'calypso/me/purchases/utils';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { useSelector } from 'calypso/state';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import CancelPurchaseSupportLink from '../cancel-purchase-support-link/support-link';
import DowngradeLoadingPlaceholder from './loading-placeholder';

import './style.scss';

interface DowngradeProps {
	siteSlug: string;
	purchaseId: number;
	onKeep: () => void;
	onDowngrade: () => void;
}

const DowngradeFeatureList: React.FC< { features: FeatureObject[]; purchase: Purchase } > = ( {
	features,
	purchase,
} ) => {
	const translate = useTranslate();

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
			<p className="cancel-purchase__features-link">
				<a href={ '/plans/my-plan/' + purchase.domain }>
					{ translate( 'View all features', {
						args: {
							productName: getName( purchase ),
						},
					} ) }
				</a>
			</p>
		</div>
	);
};

const downgradePath: Record< any, any > = {
	[ PLAN_PERSONAL ]: PLAN_FREE,
	[ PLAN_PREMIUM ]: PLAN_PERSONAL,
	[ PLAN_BUSINESS ]: PLAN_PREMIUM,
	[ PLAN_ECOMMERCE ]: PLAN_BUSINESS,
};

export const Downgrade: React.FC< DowngradeProps > = ( props ) => {
	const { siteSlug, purchaseId, onKeep, onDowngrade } = props;
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
		'get2023PricingGridSignupWpcomFeatures'
	);
	const features = featureSlugs.map( ( slug ) => getFeatureByKey( slug ) );

	if (
		isDataLoading( { hasLoadedSites, hasLoadedUserPurchasesFromServer: loadedFromServer } ) ||
		! purchase
	) {
		return (
			<div>
				<QueryUserPurchases />
				<DowngradeLoadingPlaceholder />
			</div>
		);
	}

	return (
		<Card className="downgrade__wrapper-card">
			<div className="downgrade__back">
				<div className="cancel-purchase__back">
					<HeaderCakeBack
						icon="chevron-left"
						href={ getManagePurchaseUrlFor( siteSlug, purchaseId ) }
					/>
				</div>
			</div>

			<FormattedHeader
				className="downgrade__formatted-header"
				brandFont
				headerText={ translate( 'Downgrade your %(currentPlan)s subscription', {
					args: { currentPlan: currentPlan?.getTitle() ?? '' },
				} ) }
				align="left"
			/>

			<div className="downgrade__inner-wrapper">
				<div className="downgrade__left">
					<p>
						{ translate(
							'We will change the plan immediately and pro-rate the remaining value from %(currentPlan)s to %(targetPlan)s.',
							{
								args: { currentPlan: currentPlan?.getTitle(), targetPlan: targetPlan?.getTitle() },
							}
						) }
					</p>

					<p>
						{ translate(
							'These features will no longer be available on your site when your plan changes:'
						) }
					</p>

					<DowngradeFeatureList features={ features } purchase={ purchase } />

					<div className="downgrade__confirm-buttons">
						<FormButton primary onClick={ onDowngrade }>
							{ translate( 'Downgrade to %(targetPlan)s', {
								args: { targetPlan: targetPlan?.getTitle() },
							} ) }
						</FormButton>
						<FormButton
							onClick={ onKeep }
							isPrimary={ false }
							href={ getManagePurchaseUrlFor( siteSlug, purchaseId ) }
						>
							{ translate( 'Keep %(currentPlan)s', {
								args: { currentPlan: currentPlan?.getTitle() },
							} ) }
						</FormButton>
					</div>
				</div>

				<div className="downgrade__right">
					<PurchaseSiteHeader siteId={ siteId } name={ siteName } purchase={ purchase } />
					<CancelPurchaseSupportLink purchase={ purchase } />
				</div>
			</div>
		</Card>
	);
};
