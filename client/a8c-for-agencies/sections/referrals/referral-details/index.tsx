import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import ItemView, { createFeaturePreview } from 'calypso/layout/hosting-dashboard/item-view';
import SubscriptionStatus from '../referrals-list/subscription-status';
import ReferralCommissions from './commissions';
import ReferralPurchasesMobile from './mobile/purchases-mobile';
import ReferralPurchases from './purchases';
import ReferralDetailsReferrals from './referrals';
import type { Referral, ReferralPurchase } from '../types';
import type { ItemData } from 'calypso/layout/hosting-dashboard/item-view/types';

import './style.scss';

interface Props {
	referral: Referral;
	closeSitePreviewPane: () => void;
}

const REFERRALS_ID = 'referrals';
const REFERRAL_PURCHASES_ID = 'referral-purchases';
const REFERRAL_COMMISSIONS_ID = 'referral-commissions';

export default function ReferralDetails( { referral, closeSitePreviewPane }: Props ) {
	const translate = useTranslate();

	const [ selectedReferralTab, setSelectedReferralTab ] = useState( REFERRALS_ID );

	const itemData: ItemData = {
		title: referral.client.email,
		subtitle: (
			<div className="referral-details__subtitle">
				{ translate( 'Payment status {{badge}}%(status)s{{/badge}}', {
					args: {
						status: referral.purchaseStatuses[ 0 ],
					},
					comment: '%(status) is subscription status',
					components: {
						badge: <SubscriptionStatus item={ referral } />,
					},
				} ) }
			</div>
		),
		withIcon: false,
		hideEnvDataInHeader: true,
	};

	const isDesktop = useDesktopBreakpoint();

	const purchases = useMemo( () => {
		return referral.referrals.reduce( ( acc: ReferralPurchase[], ref ) => {
			// If the referral is archived, we don't want to show it in the purchases tab
			if ( ref.status === 'archived' ) {
				return acc;
			}
			// This is a workaround to ensure the purchases match the previous purchases
			// data type. We should refactor the component to use the new data type.
			return [
				...acc,
				...ref.products.map( ( product ) => ( {
					...product,
					referral_id: ref.id,
				} ) ),
			];
		}, [] );
	}, [ referral.referrals ] );

	// Show the archived and canceled referrals at the bottom of the list
	const sortedReferrals = useMemo( () => {
		return referral.referrals.sort( ( a, b ) => {
			if ( a.status === 'archived' || a.status === 'canceled' ) {
				return 1;
			}
			if ( b.status === 'archived' || b.status === 'canceled' ) {
				return -1;
			}
			return 0;
		} );
	}, [ referral.referrals ] );

	const features = useMemo(
		() => [
			createFeaturePreview(
				REFERRALS_ID,
				translate( 'Referrals' ),
				true,
				selectedReferralTab,
				setSelectedReferralTab,
				<ReferralDetailsReferrals referrals={ sortedReferrals } />
			),
			createFeaturePreview(
				REFERRAL_PURCHASES_ID,
				translate( 'Purchases' ),
				true,
				selectedReferralTab,
				setSelectedReferralTab,
				! isDesktop ? (
					<ReferralPurchasesMobile purchases={ purchases } />
				) : (
					<ReferralPurchases purchases={ purchases } />
				)
			),
			createFeaturePreview(
				REFERRAL_COMMISSIONS_ID,
				translate( 'Commissions' ),
				true,
				selectedReferralTab,
				setSelectedReferralTab,
				<ReferralCommissions referral={ referral } />
			),
		],
		[ translate, selectedReferralTab, isDesktop, sortedReferrals, purchases, referral ]
	);

	return (
		<ItemView
			className="referral-details-items"
			itemData={ itemData }
			closeItemView={ closeSitePreviewPane }
			features={ features }
			hideNavIfSingleTab
		/>
	);
}
