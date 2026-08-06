import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import FlashMessage from '../../components/flash-message';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { formatDate } from '../../utils/datetime';
import { useScheduleCall } from '../tiers/use-schedule-call';
import { PROGRAM_INCENTIVES_URL } from './constants';
import AgencyOverviewContent from './overview-content';

// TODO: the MSD dashboard has no contact-support entry point yet. This matches the
// '#contact-support' placeholder in agency/tiers/constants.ts — wire both up together.
const CONTACT_SUPPORT_URL = '#contact-support';

function AgencyOverviewDescription( { url, createdAt }: { url?: string; createdAt?: string } ) {
	const locale = useLocale();
	const parsedDate = createdAt ? new Date( createdAt ) : undefined;
	const joinedDate = parsedDate && ! isNaN( parsedDate.getTime() ) ? parsedDate : undefined;

	return (
		<Text variant="muted" lineHeight="20px">
			{ url && <ExternalLink href={ url }>{ url.replace( /^https?:\/\//, '' ) }</ExternalLink> }
			{ url && joinedDate && ' · ' }
			{ joinedDate &&
				sprintf(
					/* translators: %s is the date the agency joined the program. */
					__( 'Joined %s' ),
					formatDate( joinedDate, locale )
				) }
		</Text>
	);
}

export default function AgencyOverview() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const agencyId = agency?.id ?? 0;
	const approvalStatus = agency?.approval_status;
	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall( agency?.id );

	if ( ! agency ) {
		return <PageLayout header={ <PageHeader title={ __( 'Overview' ) } /> } />;
	}

	return (
		<PageLayout
			header={
				<PageHeader
					title={ agency.name }
					description={
						<AgencyOverviewDescription url={ agency.url } createdAt={ agency.created_at } />
					}
				/>
			}
		>
			<FlashMessage
				id="route-not-allowed"
				type="error"
				message={ __( 'You don’t have permission to view the requested page.' ) }
			/>
			<AgencyOverviewContent
				agencyId={ agencyId }
				tierId={ agency.tier?.id }
				influencedRevenue={ agency.influenced_revenue ?? 0 }
				approvalStatus={ approvalStatus }
				capabilities={ agency.user?.capabilities }
				links={ {
					tiers: '/agency/tiers',
					referrals: '/earn/referrals',
					woopayments: '/earn/woopayments',
					contactSupport: CONTACT_SUPPORT_URL,
					helpful: [
						{
							// TODO: wire up once the MSD dashboard has a contact-support entry
							// point (see CONTACT_SUPPORT_URL above).
							id: 'contact-support',
							label: __( 'Contact sales & support' ),
						},
						{
							id: 'program-incentives',
							label: __( 'Program incentive details' ),
							href: PROGRAM_INCENTIVES_URL,
							isExternal: true,
						},
					],
				} }
				onScheduleCall={ scheduleCall }
				isSchedulingCall={ isSchedulingCall }
				recordTracksEvent={ recordTracksEvent }
			/>
		</PageLayout>
	);
}
