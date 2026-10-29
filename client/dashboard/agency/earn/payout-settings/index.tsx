import {
	activeAgencyQuery,
	tipaltiIFrameUrlQuery,
	tipaltiPayeeQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { Text } from '../../../components/text';
import { AgencyNotices } from '../../components/agency-notices';
import { getAccountStatus } from './get-account-status';
import PayoutStatusNotice, { usePayoutStatusNotice } from './payout-status-notice';
import { TipaltiPayoutSettings } from './tipalti-payout-settings';

function PaymentStatusBadge( { agencyId }: { agencyId: number } ) {
	const { data: payee } = useQuery( tipaltiPayeeQuery( agencyId ) );
	const accountStatus = getAccountStatus( payee );

	if ( ! accountStatus ) {
		return null;
	}

	return (
		<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
			<Text>{ __( 'Payment status:' ) }</Text>
			<Badge intent={ accountStatus.badgeIntent }>{ accountStatus.status }</Badge>
		</HStack>
	);
}

export default function EarnPayoutSettings() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const { data: iframeData, isLoading } = useQuery( {
		...tipaltiIFrameUrlQuery( agencyId ),
		refetchOnWindowFocus: false,
	} );
	const payoutStatusNotice = usePayoutStatusNotice( { agencyId, isLoadingPage: ! agency } );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Payout settings' ) }
					description={ __( 'Manage where and how your agency gets paid.' ) }
					actions={ agencyId ? <PaymentStatusBadge agencyId={ agencyId } /> : undefined }
				/>
			}
			notices={
				<AgencyNotices
					candidates={ [
						{
							id: 'payout-status',
							...payoutStatusNotice,
							notice: <PayoutStatusNotice agencyId={ agencyId } source="payout_settings" />,
						},
					] }
				/>
			}
		>
			<TipaltiPayoutSettings iframeUrl={ iframeData?.iframe_url } isLoading={ isLoading } />
		</PageLayout>
	);
}
