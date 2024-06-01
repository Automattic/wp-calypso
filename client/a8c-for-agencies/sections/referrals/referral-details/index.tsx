import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import ItemPreviewPane, {
	createFeaturePreview,
} from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane';
import SubscriptionStatus from '../referrals-list/subscription-status';
import ReferralCommissions from './commissions';
import ReferralPurchases from './purchases';
import type { Referral } from '../types';
import type { ItemData } from 'calypso/a8c-for-agencies/components/items-dashboard/item-preview-pane/types';

interface Props {
	referral: Referral;
	closeSitePreviewPane: () => void;
}

import './style.scss';

const REFERRAL_PURCHASES_ID = 'referral-purchases';
const REFERRAL_COMMISSIONS_ID = 'referral-commissions';
const REFERRAL_ACITIVTY_ID = 'referral-activity';

export default function ReferralDetails( { referral, closeSitePreviewPane }: Props ) {
	const translate = useTranslate();

	const [ selectedReferralTab, setSelectedReferralTab ] = useState( REFERRAL_PURCHASES_ID );

	const itemData: ItemData = {
		title: referral.client_email,
		subtitle: (
			<div className="referral-details__subtitle">
				{ translate( 'Payment status {{badge}}%(status)s{{/badge}}', {
					args: {
						status: referral.statuses[ 0 ],
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

	const features = useMemo(
		() => [
			createFeaturePreview(
				REFERRAL_PURCHASES_ID,
				translate( 'Purchases' ),
				true,
				selectedReferralTab,
				setSelectedReferralTab,
				<ReferralPurchases purchases={ referral.purchases } />
			),
			createFeaturePreview(
				REFERRAL_COMMISSIONS_ID,
				translate( 'Commissions' ),
				true,
				selectedReferralTab,
				setSelectedReferralTab,
				<ReferralCommissions referral={ referral } />
			),
			createFeaturePreview(
				REFERRAL_ACITIVTY_ID,
				translate( 'Activity' ),
				true,
				selectedReferralTab,
				setSelectedReferralTab,
				'Activity tab content'
			),
		],
		[ referral, selectedReferralTab, translate ]
	);

	return (
		<ItemPreviewPane
			itemData={ itemData }
			closeItemPreviewPane={ closeSitePreviewPane }
			features={ features }
		/>
	);
}
