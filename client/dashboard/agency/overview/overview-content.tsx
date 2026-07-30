import { __experimentalGrid as Grid, __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { PendingTierCard, RejectedTierCard } from './application-status-cards';
import EventCard from './event-card';
import HelpfulLinksCard from './helpful-links-card';
import ReferralEarningsCard from './referral-earnings-card';
import TierOverviewCard from './tier-overview-card';
import WooPaymentsRevenueCard from './woopayments-revenue-card';
import type { HelpfulLink } from './helpful-links-card';
import type { AgencyTierType, RecordTracksEvent } from '../tiers/types';
import type { AgencyApprovalStatus } from '@automattic/api-core';

export interface AgencyOverviewLinks {
	tiers: string;
	referrals: string;
	woopayments: string;
	contactSupport: string;
	helpful: HelpfulLink[];
}

export interface AgencyOverviewContentProps {
	agencyId: number;
	tierId?: AgencyTierType;
	influencedRevenue: number;
	/** Agencies predating the field report an empty string and are treated as approved. */
	approvalStatus?: AgencyApprovalStatus | '';
	links: AgencyOverviewLinks;
	useRouterLink?: boolean;
	onScheduleCall?: () => void;
	isSchedulingCall?: boolean;
	onRelaunchTour?: () => void;
	recordTracksEvent?: RecordTracksEvent;
}

/**
 * Shared body of the agency Overview screen. The dashboard and
 * a8c-for-agencies both render it, each injecting its own data,
 * links, and analytics client.
 */
export default function AgencyOverviewContent( {
	agencyId,
	tierId,
	influencedRevenue,
	approvalStatus,
	links,
	useRouterLink,
	onScheduleCall,
	isSchedulingCall,
	onRelaunchTour,
	recordTracksEvent,
}: AgencyOverviewContentProps ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const spacing = isSmallViewport ? 4 : 6;
	const isPending = approvalStatus === 'pending';
	const isRejected = approvalStatus === 'rejected';
	// A rejection is already spelled out by the tier card, so only pending accounts get the note.
	const isLocked = isPending || isRejected;
	const lockedNote = isPending ? __( 'Unlocks when your account is activated' ) : undefined;

	return (
		<Grid columns={ isSmallViewport ? 1 : 2 } gap={ spacing }>
			<VStack spacing={ spacing } justify="flex-start">
				{ isRejected && <RejectedTierCard contactSupportHref={ links.contactSupport } /> }
				{ isPending && (
					<PendingTierCard
						onRelaunchTour={ onRelaunchTour }
						recordTracksEvent={ recordTracksEvent }
					/>
				) }
				{ ! isRejected && ! isPending && (
					<TierOverviewCard
						tierId={ tierId }
						influencedRevenue={ influencedRevenue }
						tiersHref={ links.tiers }
						useRouterLink={ useRouterLink }
						onScheduleCall={ onScheduleCall }
						isSchedulingCall={ isSchedulingCall }
						recordTracksEvent={ recordTracksEvent }
					/>
				) }
				<ReferralEarningsCard
					agencyId={ agencyId }
					locked={ isLocked }
					lockedNote={ lockedNote }
					referralsHref={ links.referrals }
					useRouterLink={ useRouterLink }
					recordTracksEvent={ recordTracksEvent }
				/>
				<WooPaymentsRevenueCard
					agencyId={ agencyId }
					locked={ isLocked }
					lockedNote={ lockedNote }
					woopaymentsHref={ links.woopayments }
					useRouterLink={ useRouterLink }
					recordTracksEvent={ recordTracksEvent }
				/>
			</VStack>
			<VStack spacing={ spacing } justify="flex-start">
				<EventCard recordTracksEvent={ recordTracksEvent } />
				<HelpfulLinksCard links={ links.helpful } recordTracksEvent={ recordTracksEvent } />
			</VStack>
		</Grid>
	);
}
