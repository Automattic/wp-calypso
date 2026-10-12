import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import FlashMessage from '../../components/flash-message';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { MARKETPLACE_HOSTING_ROUTE, getMarketplaceHostingSectionRoute } from '../marketplace/paths';
import { useMarketplaceType } from '../marketplace/use-marketplace-type';
import { PARTNER_DIRECTORY_ROUTE } from '../partner-directory/paths';
import { useContactSupport } from '../support/use-contact-support';
import getCurrentAgencyTier from '../tiers/get-current-agency-tier';
import { useScheduleCall } from '../tiers/use-schedule-call';
import { PROGRAM_INCENTIVES_URL, TIER_OVERVIEW_CONTENT } from './constants';
import NewTabLabel from './new-tab-label';
import AgencyOverviewContent from './overview-content';
import AgencyOverviewHeader, { AgencyOverviewHeaderInfo } from './overview-header';
import LeadsCard from './tailored/leads-card';
import LearnCard from './tailored/learn-card';
import { SAMPLE_JOIN_URL, getPartnerCalls } from './tailored/partner-calls';
import PartnerManagerCard from './tailored/partner-manager-card';
import { GETTING_STARTED_ADVISOR_ID, getPartnerManager } from './tailored/partner-managers';
import PrototypeControlPanel from './tailored/prototype-control-panel';
import {
	isOverviewPrototypeEnabled,
	updatePrototypeSettings,
	usePrototypeSettings,
} from './tailored/prototype-settings';
import { useSignupProfile } from './tailored/signup-profile';
import TailoredPlanCard from './tailored/tailored-plan-card';
import TierStrip from './tailored/tier-strip';
import WhatsNewCard from './tailored/whats-new-card';
import usePressableOfferEligibility from './use-pressable-offer-eligibility';
import type { HelpfulLink } from './helpful-links-card';
import type { AgencyOverviewContentProps } from './overview-content';
import type { PartnerManager } from './tailored/partner-managers';
import type { SignupProfile } from './tailored/signup-profile';
import type { RecordTracksEvent } from '../tiers/types';
import type { BookedAdvisorCall, PlanCall } from './tailored/tailored-plan-card';

// PROTOTYPE: the signup URL is free text from storage, so only plain domains become links.
function toSafeUrl( value: string ) {
	const domain = value.trim().replace( /^https?:\/\//i, '' );
	return /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/[\w\-./]*)?$/i.test( domain )
		? `https://${ domain }`
		: undefined;
}

// PROTOTYPE: what the getting-started agency has already done: sent referrals, bought a
// small Pressable plan, watched the directory demo, browsed the Library, connected their
// client sites, and invited a teammate.
const GETTING_STARTED_DONE_STEPS = [
	'refer-first-client',
	'compare-hosting',
	'watch-partner-directory-demo',
	'explore-library',
	'connect-sites',
	'invite-team',
];

// PROTOTYPE: the getting-started agency's booked advisor call, four days out at 2pm.
function getSampleAdvisorCall(
	advisor: PartnerManager,
	discussionNotes: string
): BookedAdvisorCall {
	const date = new Date( Date.now() + 4 * 24 * 60 * 60 * 1000 );
	date.setHours( 14, 0, 0, 0 );
	return {
		advisor,
		date,
		joinUrl: SAMPLE_JOIN_URL,
		topic: __( 'We’ll walk through setting up WooPayments on your client stores.' ),
		discussionNotes,
		onSaveNotes: ( notes ) => updatePrototypeSettings( { discussionNotes: notes } ),
	};
}

// PROTOTYPE: "Good morning, Jamie" by the viewer's local time.
function getGreeting( firstName: string ) {
	const hour = new Date().getHours();
	if ( ! firstName ) {
		if ( hour < 12 ) {
			return __( 'Good morning' );
		}
		return hour < 18 ? __( 'Good afternoon' ) : __( 'Good evening' );
	}
	if ( hour < 12 ) {
		/* translators: %s is the person's first name */
		return sprintf( __( 'Good morning, %s' ), firstName );
	}
	return hour < 18
		? /* translators: %s is the person's first name */
			sprintf( __( 'Good afternoon, %s' ), firstName )
		: /* translators: %s is the person's first name */
			sprintf( __( 'Good evening, %s' ), firstName );
}

// PROTOTYPE: greets the agency with what it told us at signup.
// The agency URL and joined date stay visible for every agency, whatever the tier.
function TailoredOverviewHeader( {
	profile,
	fallbackName,
	url,
	createdAt,
	locale,
	links,
	recordTracksEvent,
}: {
	profile: SignupProfile;
	fallbackName?: string;
	url?: string;
	createdAt?: string;
	locale: string;
	/** Helpful links, shown as simple links at the top right. */
	links: HelpfulLink[];
	recordTracksEvent?: RecordTracksEvent;
} ) {
	return (
		<PageHeader
			title={ getGreeting( profile.firstName ) }
			description={
				<HStack spacing={ 1 } justify="flex-start" wrap expanded={ false }>
					<Text variant="muted" size={ 13 } lineHeight="20px">
						{ profile.agencyName || fallbackName }
						{ ( url || createdAt ) && <span>{ ' · ' }</span> }
					</Text>
					<AgencyOverviewHeaderInfo url={ url } createdAt={ createdAt } locale={ locale } />
				</HStack>
			}
			actions={
				<HStack spacing={ 4 } justify="flex-end" expanded={ false } wrap>
					{ links.map( ( link ) => (
						<Button
							key={ link.id }
							variant="link"
							href={ link.href }
							target={ link.isExternal ? '_blank' : undefined }
							rel={ link.isExternal ? 'noreferrer' : undefined }
							onClick={ () => {
								recordTracksEvent?.( 'calypso_a4a_overview_helpful_link_click', {
									link_id: link.id,
								} );
								link.onClick?.();
							} }
						>
							{ link.isExternal ? <NewTabLabel>{ link.label }</NewTabLabel> : link.label }
						</Button>
					) ) }
				</HStack>
			}
		/>
	);
}

// PROTOTYPE: sample numbers that add up to the established scenario's $9,240 IAR
// (rolling 12 months): $5,120 in referred product and hosting revenue, plus
// $4,120 from $412,000 in WooPayments volume ($1 of IAR per $100).
const ESTABLISHED_SAMPLE_EARNINGS: AgencyOverviewContentProps[ 'sampleEarnings' ] = {
	referrals: {
		// Commissions on the $5,120 referred (~30% blended), about $380 a quarter.
		currentQuarter: 412,
		activeReferrals: 9,
		pendingPayout: 376,
		lifetimeEarnings: 1980,
	},
	woopayments: {
		// 0.05% revenue share on roughly $103,000 processed this quarter.
		currentQuarter: 51.5,
		activeStores: 4,
		totalProcessed: 412000,
	},
};

// PROTOTYPE: $780 IAR: their own small Pressable plan plus two referred subscriptions.
const GETTING_STARTED_SAMPLE_EARNINGS: AgencyOverviewContentProps[ 'sampleEarnings' ] = {
	referrals: {
		currentQuarter: 36,
		activeReferrals: 2,
		pendingPayout: 24,
		lifetimeEarnings: 60,
	},
	// No WooPayments stores yet, so the card shows its setup state.
	woopayments: { currentQuarter: 0, activeStores: 0, totalProcessed: 0 },
};

export default function AgencyOverview() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();
	const { updateMarketplaceType } = useMarketplaceType();
	// PROTOTYPE: the growth plan's referral step opens hosting with referral mode on.
	const referInMarketplace = () => {
		updateMarketplaceType( 'referral' );
		navigate( { to: MARKETPLACE_HOSTING_ROUTE } );
	};
	const { openContactForm } = useContactSupport();
	const locale = useLocale();
	const agencyId = agency?.id ?? 0;
	const hasPartnerDirectoryListing =
		!! agency?.profile?.partner_directory_application?.directories.some(
			( { status } ) => status === 'approved'
		);
	const { scheduleCall, isLoading: isSchedulingCall } = useScheduleCall( agency?.id );
	const { isEligibleForPressableIntroOffer, isEligibleForPressableExpansionOffer } =
		usePressableOfferEligibility( agency );
	const isPrototype = isOverviewPrototypeEnabled();
	const storedProfile = useSignupProfile();
	const prototypeSettings = usePrototypeSettings();
	const experience = prototypeSettings.experience ?? ( storedProfile ? 'new' : 'established' );
	// PROTOTYPE: partly invested agencies (a little IAR, a couple of referrals, a small
	// Pressable plan) still get the new agency layout, with their progress filled in.
	const isGettingStarted = experience === 'getting-started';
	// PROTOTYPE: every agency with signup answers gets the “Welcome, {name}” header.
	const headerProfile = isPrototype ? storedProfile : null;
	// Both experiences get the growth plan once signup goals exist.
	const tailoredPlanProfile = isPrototype && storedProfile?.goals.length ? storedProfile : null;
	const approvalStatus =
		isPrototype && prototypeSettings.approvalStatus !== 'real'
			? prototypeSettings.approvalStatus
			: agency?.approval_status;
	const tierId =
		isPrototype && prototypeSettings.tierId !== 'real'
			? prototypeSettings.tierId
			: agency?.tier?.id;

	// PROTOTYPE: established agencies with a partner manager (Pro tier and up) get a
	// check-in with them; everyone else gets the 30 minute advisor call.
	const hasPartnerManager = !! ( tierId && TIER_OVERVIEW_CONTENT[ tierId ]?.hasPartnerManager );
	const planCall: PlanCall =
		experience === 'established' && hasPartnerManager
			? {
					type: 'check-in',
					manager: getPartnerManager( prototypeSettings.partnerManagerId ),
					calls: getPartnerCalls( prototypeSettings.callScenario, storedProfile?.goals ?? [] ),
					completedTodoIds: prototypeSettings.completedTodoIds,
					discussionNotes: prototypeSettings.discussionNotes,
					onSaveNotes: ( discussionNotes ) => updatePrototypeSettings( { discussionNotes } ),
					onToggleTodo: ( id ) => {
						const done = prototypeSettings.completedTodoIds;
						updatePrototypeSettings( {
							completedTodoIds: done.includes( id )
								? done.filter( ( doneId ) => doneId !== id )
								: [ ...done, id ],
						} );
					},
				}
			: {
					type: 'advisor',
					booked: isGettingStarted
						? getSampleAdvisorCall(
								getPartnerManager( GETTING_STARTED_ADVISOR_ID ),
								prototypeSettings.discussionNotes
							)
						: undefined,
				};

	// PROTOTYPE: the control panel can override IAR to demo tier progress.
	const influencedRevenue =
		isPrototype && prototypeSettings.influencedRevenue !== null
			? prototypeSettings.influencedRevenue
			: ( agency?.influenced_revenue ?? 0 );
	const tierLevel = getCurrentAgencyTier( tierId )?.level ?? 0;
	// PROTOTYPE: brand-new agencies (Account activated tier) don't see leads, referral, or
	// WooPayments cards yet. Agencies placed manually in a higher tier still do.
	const hideEarningsCards = experience === 'new' && tierLevel === 0;

	// PROTOTYPE: the tier and influenced revenue sit at the top of the partner manager card
	// or, for new agencies, the growth plan. Pending and rejected accounts keep their status card.
	const tierStrip = (
		<TierStrip
			tierId={ tierId }
			influencedRevenue={ influencedRevenue }
			tiersHref="/tiers"
			recordTracksEvent={ recordTracksEvent }
		/>
	);
	const isAccountActive = approvalStatus !== 'pending' && approvalStatus !== 'rejected';
	const hasTierInPlan = isAccountActive && planCall.type !== 'check-in';

	// PROTOTYPE: the partner manager card (established, Pro and up) and the growth plan.
	const partnerManagerCard =
		tailoredPlanProfile && planCall.type === 'check-in' ? (
			<PartnerManagerCard
				manager={ planCall.manager }
				calls={ planCall.calls }
				completedTodoIds={ planCall.completedTodoIds }
				onToggleTodo={ planCall.onToggleTodo }
				discussionNotes={ planCall.discussionNotes }
				onSaveNotes={ planCall.onSaveNotes }
				onScheduleCall={ scheduleCall }
				isSchedulingCall={ isSchedulingCall }
				tierStrip={ tierStrip }
			/>
		) : null;
	const growthPlanCard = tailoredPlanProfile ? (
		<TailoredPlanCard
			profile={ tailoredPlanProfile }
			call={ planCall }
			tierLevel={ tierLevel }
			onScheduleCall={ scheduleCall }
			isSchedulingCall={ isSchedulingCall }
			tierStrip={ hasTierInPlan && tierStrip }
			// PROTOTYPE: new agencies never see the tier and IAR meter; getting-started and
			// established agencies do.
			showTierProgress={ experience !== 'new' }
			completedStepIds={ isGettingStarted ? GETTING_STARTED_DONE_STEPS : undefined }
			links={ {
				partnerDirectory: PARTNER_DIRECTORY_ROUTE,
				tiers: '/tiers',
				referrals: '/referrals',
				woopayments: '/woopayments',
				wpcomHosting: getMarketplaceHostingSectionRoute( 'wpcom' ),
				pressableHosting: getMarketplaceHostingSectionRoute( 'pressable' ),
				sites: '/sites',
				team: '/agency/team',
				aiMcp: '/agency/ai',
				library: '/library',
				contactSupport: () => openContactForm(),
				referInMarketplace,
			} }
		/>
	) : null;
	const isPillarLayout = isPrototype && experience === 'established';

	const helpfulLinks: HelpfulLink[] = [
		{
			id: 'contact-support',
			label: __( 'Contact sales & support' ),
			onClick: () => openContactForm(),
		},
		{
			id: 'program-incentives',
			label: __( 'Program incentive details' ),
			href: PROGRAM_INCENTIVES_URL,
			isExternal: true,
		},
	];

	let sampleEarnings: AgencyOverviewContentProps[ 'sampleEarnings' ];
	if ( isPrototype && experience === 'established' ) {
		sampleEarnings = ESTABLISHED_SAMPLE_EARNINGS;
	} else if ( isPrototype && isGettingStarted ) {
		sampleEarnings = GETTING_STARTED_SAMPLE_EARNINGS;
	}

	if ( ! agency ) {
		return <PageLayout header={ <PageHeader title={ __( 'Overview' ) } /> } />;
	}

	return (
		<PageLayout
			header={
				headerProfile ? (
					<TailoredOverviewHeader
						profile={ headerProfile }
						fallbackName={ agency.name }
						url={ toSafeUrl( headerProfile.agencyUrl ) ?? agency.url }
						createdAt={ agency.created_at }
						locale={ locale }
						links={ helpfulLinks }
						recordTracksEvent={ recordTracksEvent }
					/>
				) : (
					<AgencyOverviewHeader
						name={ agency.name }
						url={ agency.url }
						createdAt={ agency.created_at }
						locale={ locale }
					/>
				)
			}
		>
			<FlashMessage
				id="route-not-allowed"
				type="error"
				message={ __( 'You don’t have permission to view the requested page.' ) }
			/>
			<AgencyOverviewContent
				agencyId={ agencyId }
				tierId={ tierId }
				influencedRevenue={ influencedRevenue }
				approvalStatus={ approvalStatus }
				capabilities={ agency.user?.capabilities }
				hasPartnerDirectoryListing={ hasPartnerDirectoryListing }
				isEligibleForPressableIntroOffer={ isEligibleForPressableIntroOffer }
				isEligibleForPressableExpansionOffer={ isEligibleForPressableExpansionOffer }
				links={ {
					tiers: '/tiers',
					sites: '/sites',
					referrals: '/referrals',
					woopayments: '/woopayments',
					marketplace: '/marketplace',
					partnerDirectory: PARTNER_DIRECTORY_ROUTE,
					contactSupport: () => openContactForm(),
					aiMcp: '/agency/ai',
					pressableHosting: getMarketplaceHostingSectionRoute( 'pressable' ),
					helpful: helpfulLinks,
				} }
				onScheduleCall={ scheduleCall }
				isSchedulingCall={ isSchedulingCall }
				recordTracksEvent={ recordTracksEvent }
				hideEarningsCards={ isPrototype && hideEarningsCards }
				pillarLayout={ isPillarLayout }
				learnCard={
					tailoredPlanProfile && (
						<LearnCard goals={ tailoredPlanProfile.goals } libraryHref="/library" />
					)
				}
				sampleEarnings={ sampleEarnings }
				leadsCard={
					tailoredPlanProfile &&
					! hideEarningsCards && (
						<LeadsCard
							tierLevel={ tierLevel }
							influencedRevenue={ influencedRevenue }
							profile={ tailoredPlanProfile }
							lockedNote={
								approvalStatus === 'pending'
									? __( 'Unlocks when your account is activated' )
									: undefined
							}
							links={ {
								partnerDirectory: PARTNER_DIRECTORY_ROUTE,
								leads: '/leads',
								wpcomHosting: getMarketplaceHostingSectionRoute( 'wpcom' ),
								pressableHosting: getMarketplaceHostingSectionRoute( 'pressable' ),
								referrals: '/referrals',
								woopayments: '/woopayments',
							} }
						/>
					)
				}
				whatsNew={
					tailoredPlanProfile && (
						<WhatsNewCard
							goals={ tailoredPlanProfile.goals }
							recordTracksEvent={ recordTracksEvent }
						/>
					)
				}
				partnerManagerCard={ isPillarLayout ? partnerManagerCard : undefined }
				tierInPlan={ hasTierInPlan }
				earnSection={ isPrototype && isGettingStarted }
				tailoredPlan={
					tailoredPlanProfile &&
					// PROTOTYPE: agencies with a partner manager no longer get the growth plan.
					( isPillarLayout ? (
						! partnerManagerCard && growthPlanCard
					) : (
						<>
							{ partnerManagerCard }
							{ growthPlanCard }
						</>
					) )
				}
			/>
			{ isPrototype && (
				<PrototypeControlPanel
					isOpen={ prototypeSettings.isPanelOpen }
					experience={ experience }
					profile={ storedProfile }
					approvalStatus={ prototypeSettings.approvalStatus }
					tierId={ prototypeSettings.tierId }
					partnerManagerId={ prototypeSettings.partnerManagerId }
					callScenario={ prototypeSettings.callScenario }
					influencedRevenue={ prototypeSettings.influencedRevenue }
					showsPartnerManager={ experience === 'established' && hasPartnerManager }
				/>
			) }
		</PageLayout>
	);
}
