import { __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import Grid from '../../components/grid';
import { SectionHeader } from '../../components/section-header';
import { PendingTierCard, RejectedTierCard } from './application-status-cards';
import EventCard from './event-card';
import GrowthCard from './growth-card';
import HelpfulLinksCard from './helpful-links-card';
import ReferralEarningsCard from './referral-earnings-card';
import TierOverviewCard from './tier-overview-card';
import WooPaymentsRevenueCard from './woopayments-revenue-card';
import type { HelpfulLink } from './helpful-links-card';
import type { AgencyTierType, RecordTracksEvent } from '../tiers/types';
import type { AgencyApprovalStatus } from '@automattic/api-core';
import type { ComponentProps, ReactNode } from 'react';

// The WooPayments routes gate on the referrals capability too (see
// a8c-for-agencies/lib/permission.ts), so one capability locks both earning cards.
const REFERRALS_CAPABILITY = 'a4a_read_referrals';

export interface AgencyOverviewLinks {
	tiers: string;
	sites: string;
	referrals: string;
	woopayments: string;
	marketplace: string;
	partnerDirectory: string;
	/** A URL, or a callback that opens contact support in-app. */
	contactSupport: string | ( () => void );
	aiMcp: string;
	pressableHosting: string;
	helpful: HelpfulLink[];
}

export interface AgencyOverviewContentProps {
	agencyId: number;
	tierId?: AgencyTierType;
	influencedRevenue: number;
	/** Agencies predating the field report an empty string and are treated as approved. */
	approvalStatus?: AgencyApprovalStatus | '';
	/** The current user's agency capabilities; the earning cards lock without referrals access. */
	capabilities?: string[];
	/** Whether the agency already has an approved Partner Directory listing. */
	hasPartnerDirectoryListing?: boolean;
	/** Shows the Pressable introductory offer in the news column. */
	isEligibleForPressableIntroOffer?: boolean;
	/** Shows the Pressable expansion offer in the news column. */
	isEligibleForPressableExpansionOffer?: boolean;
	links: AgencyOverviewLinks;
	shouldUseRouterLink?: boolean;
	onScheduleCall?: () => void;
	isSchedulingCall?: boolean;
	onRelaunchTour?: () => void;
	recordTracksEvent?: RecordTracksEvent;
	/** PROTOTYPE: a tailored plan shown above the grid in place of the Growth card. */
	tailoredPlan?: ReactNode;
	/** PROTOTYPE: the tabbed “What’s new” card, replacing the event card in the tailored layout. */
	whatsNew?: ReactNode;
	/** PROTOTYPE: the client leads card, shown above the earnings cards in the tailored layout. */
	leadsCard?: ReactNode;
	/** PROTOTYPE: hides the Referral and WooPayments cards (new agencies that aren't relevant to yet). */
	hideEarningsCards?: boolean;
	/** PROTOTYPE: sample earnings for the established-agency demo. */
	/**
	 * PROTOTYPE: established agencies get a page organized by program pillar:
	 * a primary section (partner manager, growth plan, tier), then Earn and Grow.
	 */
	pillarLayout?: boolean;
	learnCard?: ReactNode;
	/** PROTOTYPE: partner manager card with the tier summary inside; replaces the tier card. */
	partnerManagerCard?: ReactNode;
	sampleEarnings?: {
		referrals: NonNullable< ComponentProps< typeof ReferralEarningsCard >[ 'sample' ] >;
		woopayments: NonNullable< ComponentProps< typeof WooPaymentsRevenueCard >[ 'sample' ] >;
	};
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
	capabilities,
	hasPartnerDirectoryListing,
	isEligibleForPressableIntroOffer,
	isEligibleForPressableExpansionOffer,
	links,
	shouldUseRouterLink,
	onScheduleCall,
	isSchedulingCall,
	onRelaunchTour,
	recordTracksEvent,
	tailoredPlan,
	whatsNew,
	leadsCard,
	hideEarningsCards = false,
	sampleEarnings,
	pillarLayout = false,
	learnCard,
	partnerManagerCard,
}: AgencyOverviewContentProps ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const spacing = isSmallViewport ? 4 : 6;
	const isPending = approvalStatus === 'pending';
	const isRejected = approvalStatus === 'rejected';
	const canAccessEarnings = ! capabilities || capabilities.includes( REFERRALS_CAPABILITY );
	// A rejection is already spelled out by the tier card, so only pending accounts get the note.
	const isLocked = isPending || isRejected || ! canAccessEarnings;
	const lockedNote = isPending ? __( 'Unlocks when your account is activated' ) : undefined;

	const tierCard = (
		<>
			{ isRejected && <RejectedTierCard contactSupport={ links.contactSupport } /> }
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
					shouldUseRouterLink={ shouldUseRouterLink }
					// PROTOTYPE: the growth plan owns the call CTA, so the tier card drops its copy.
					onScheduleCall={ tailoredPlan ? undefined : onScheduleCall }
					isSchedulingCall={ isSchedulingCall }
					recordTracksEvent={ recordTracksEvent }
				/>
			) }
		</>
	);

	// PROTOTYPE: `sample` swaps in demo numbers for the established-agency experience.
	const earningsCards = (
		<>
			<ReferralEarningsCard
				sample={ sampleEarnings?.referrals }
				agencyId={ agencyId }
				locked={ isLocked }
				lockedNote={ lockedNote }
				referralsHref={ links.referrals }
				shouldUseRouterLink={ shouldUseRouterLink }
				recordTracksEvent={ recordTracksEvent }
			/>
			<WooPaymentsRevenueCard
				sample={ sampleEarnings?.woopayments }
				agencyId={ agencyId }
				locked={ isLocked }
				lockedNote={ lockedNote }
				woopaymentsHref={ links.woopayments }
				shouldUseRouterLink={ shouldUseRouterLink }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);

	const sideCards = (
		<>
			<HelpfulLinksCard links={ links.helpful } recordTracksEvent={ recordTracksEvent } />
			<EventCard
				isEligibleForPressableIntroOffer={ isEligibleForPressableIntroOffer }
				isEligibleForPressableExpansionOffer={ isEligibleForPressableExpansionOffer }
				aiMcpHref={ links.aiMcp }
				pressableHostingHref={ links.pressableHosting }
				shouldUseRouterLink={ shouldUseRouterLink }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);

	const columns = isSmallViewport ? 1 : 2;
	const gap = isSmallViewport ? 'lg' : 'xl';

	// PROTOTYPE: established agencies, organized by the program's Earn and Grow pillars.
	if ( tailoredPlan && pillarLayout ) {
		const pillar = ( title: string, description: string, content: ReactNode ) => (
			<VStack spacing={ 4 } justify="flex-start">
				<SectionHeader level={ 2 } title={ title } description={ description } />
				{ content }
			</VStack>
		);
		return (
			<VStack spacing={ isSmallViewport ? 8 : 10 }>
				{ /* With a partner manager, the tier lives inside their card and the plan sits beside it. */ }
				<Grid columns={ columns } gap={ gap }>
					<VStack spacing={ spacing } justify="flex-start">
						{ partnerManagerCard ?? tailoredPlan }
					</VStack>
					<VStack spacing={ spacing } justify="flex-start">
						{ partnerManagerCard ? tailoredPlan : tierCard }
					</VStack>
				</Grid>
				{ /* Earn fills the left column, Grow the right. */ }
				<Grid columns={ columns } gap={ gap }>
					{ pillar(
						__( 'Earn' ),
						__( 'Leads and recurring income from the program.' ),
						<VStack spacing={ spacing } justify="flex-start">
							{ leadsCard }
							{ earningsCards }
						</VStack>
					) }
					{ pillar(
						__( 'Grow' ),
						__( 'Events, news, and training to grow your agency.' ),
						<VStack spacing={ spacing } justify="flex-start">
							{ whatsNew }
							{ learnCard }
						</VStack>
					) }
				</Grid>
			</VStack>
		);
	}

	// PROTOTYPE: the tailored plan leads the left column and the tier card moves to the right.
	// Helpful links move to the page header.
	if ( tailoredPlan ) {
		return (
			<VStack spacing={ spacing }>
				<Grid columns={ columns } gap={ gap }>
					<VStack spacing={ spacing } justify="flex-start">
						{ tailoredPlan }
						{ leadsCard }
						{ ! hideEarningsCards && earningsCards }
					</VStack>
					<VStack spacing={ spacing } justify="flex-start">
						{ tierCard }
						{ whatsNew }
					</VStack>
				</Grid>
			</VStack>
		);
	}

	return (
		<Grid columns={ columns } gap={ gap }>
			<VStack spacing={ spacing } justify="flex-start">
				{ tierCard }
				{ ! isRejected && (
					<GrowthCard
						isPending={ isPending }
						capabilities={ capabilities }
						hasPartnerDirectoryListing={ hasPartnerDirectoryListing }
						tierId={ tierId }
						links={ links }
						shouldUseRouterLink={ shouldUseRouterLink }
						recordTracksEvent={ recordTracksEvent }
					/>
				) }
				{ earningsCards }
			</VStack>
			<VStack spacing={ spacing } justify="flex-start">
				{ sideCards }
			</VStack>
		</Grid>
	);
}
