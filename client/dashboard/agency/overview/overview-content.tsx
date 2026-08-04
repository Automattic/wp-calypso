import { __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { PendingTierCard, RejectedTierCard } from './application-status-cards';
import TierOverviewCard from './tier-overview-card';
import type { AgencyTierType, RecordTracksEvent } from '../tiers/types';
import type { AgencyApprovalStatus } from '@automattic/api-core';

export interface AgencyOverviewLinks {
	tiers: string;
	contactSupport: string;
}

export interface AgencyOverviewContentProps {
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

	return (
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
		</VStack>
	);
}
