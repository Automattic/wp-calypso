import { Badge } from '@automattic/ui';
import { ReactNode } from 'react';
import { getReferralStatus } from 'calypso/dashboard/agency/earn/referrals/lib/get-referral-status';

export default function ReferralStatus( { status }: { status: string } ): ReactNode {
	const { status: statusText, type } = getReferralStatus( status );

	return <Badge intent={ type }>{ statusText }</Badge>;
}
