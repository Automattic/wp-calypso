import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import { getReferralStatus } from '../../lib/get-referral-status';

export default function ReferralStatus( { status }: { status: string } ): ReactNode {
	const translate = useTranslate();

	const { status: statusText, type } = getReferralStatus( status, translate );

	return (
		<StatusBadge
			statusProps={ {
				children: statusText,
				type,
			} }
		/>
	);
}
