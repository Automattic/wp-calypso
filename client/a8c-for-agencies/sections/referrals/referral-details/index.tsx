import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import ItemPreviewPane, {
	createFeaturePreview,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import SubscriptionStatus from '../referrals-list/subscription-status';
import ReferralPurchasesMobile from './mobile/purchases-mobile';
import ReferralPurchases from './purchases';
import type { Referral } from '../types';
import type { ItemData } from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';

import './style.scss';

interface Props {
	referral: Referral;
	closeSitePreviewPane: () => void;
}

const REFERRAL_PURCHASES_ID = 'referral-purchases';

export default function ReferralDetails( { referral, closeSitePreviewPane }: Props ) {
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
						badge: <SubscriptionStatus item={ referral } />,
					},
				} ) }
			</div>
		),
		withIcon: false,
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
		],
		[ referral, selectedReferralTab, translate, isDesktop ]
	);

	return (
		<ItemPreviewPane
			className="referral-details-items"
			itemData={ itemData }
			closeItemPreviewPane={ closeSitePreviewPane }
			features={ features }
			hideNavIfSingleTab
		/>
	);
}
