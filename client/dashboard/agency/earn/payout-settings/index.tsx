import {
	activeAgencyQuery,
	tipaltiIFrameUrlQuery,
	tipaltiPayeeQuery,
} from '@automattic/api-queries';
import { AutomatticLogo } from '@automattic/components/src/logos/automattic-logo';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useState } from 'react';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
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

// The embedded Tipalti form adds entries to the browser history, so Back links to
// the page this one was opened from instead of stepping back through them.
function BackButton() {
	const router = useRouter();
	const [ backTo ] = useState( () => {
		const from = router.state.resolvedLocation;
		return from && from.pathname !== '/payout-settings' ? from.href : '/overview';
	} );

	return (
		<RouterLinkButton to={ backTo } variant="link" icon={ isRTL() ? chevronRight : chevronLeft }>
			{ __( 'Back' ) }
		</RouterLinkButton>
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
		<div className="earn-payout-settings">
			<HStack
				className="earn-payout-settings-top-bar"
				justify="flex-start"
				spacing={ 6 }
				expanded={ false }
			>
				<AutomatticLogo width={ 183 } height={ 40 } />
				<BackButton />
			</HStack>
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
		</div>
	);
}
