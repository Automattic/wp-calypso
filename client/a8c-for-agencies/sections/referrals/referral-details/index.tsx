import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import ItemView, { createFeaturePreview } from 'calypso/layout/hosting-dashboard/item-view';
import SubscriptionStatus from '../referrals-list/subscription-status';
import ReferralCommissions from './commissions';
import ArchivedStatus from './components/archived-status';
import ReferralPurchasesMobile from './mobile/purchases-mobile';
import ReferralPurchases from './purchases';
import type { Referral, ReferralInvoice } from '../types';
import type { ItemData } from 'calypso/layout/hosting-dashboard/item-view/types';

import './style.scss';

interface Props {
	referral: Referral;
	closeSitePreviewPane: () => void;
	isArchiveView: boolean;
	referralInvoices: ReferralInvoice[];
}

const REFERRAL_PURCHASES_ID = 'referral-purchases';
const REFERRAL_COMMISSIONS_ID = 'referral-commissions';

export default function ReferralDetails( {
	referral,
	closeSitePreviewPane,
	isArchiveView,
}: Props ) {
	const translate = useTranslate();

	const [ selectedReferralTab, setSelectedReferralTab ] = useState( REFERRAL_PURCHASES_ID );

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
						badge: ! isArchiveView ? <SubscriptionStatus item={ referral } /> : <ArchivedStatus />,
					},
				} ) }
			</div>
		),
		withIcon: false,
		hideEnvDataInHeader: true,
	};

	const isDesktop = useDesktopBreakpoint();

	const features = useMemo(
		() => [
			createFeaturePreview(
				REFERRAL_PURCHASES_ID,
				translate( 'Purchases' ),
				true,
				selectedReferralTab,
				setSelectedReferralTab,
				! isDesktop ? (
					<ReferralPurchasesMobile purchases={ referral.purchases } />
				) : (
					<ReferralPurchases purchases={ referral.purchases } />
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
		[ translate, selectedReferralTab, isDesktop, referral ]
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
