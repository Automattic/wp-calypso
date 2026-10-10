import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import FlashMessage from '../../components/flash-message';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { getMarketplaceHostingSectionRoute } from '../marketplace/paths';
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
import { getPartnerCalls } from './tailored/partner-calls';
import PartnerManagerCard from './tailored/partner-manager-card';
import { getPartnerManager } from './tailored/partner-managers';
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
import type { SignupProfile } from './tailored/signup-profile';
import type { RecordTracksEvent } from '../tiers/types';
import type { PlanCall } from './tailored/tailored-plan-card';

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
			title={
				profile.firstName
					? sprintf(
							/* translators: %s is the person's first name */
							__( 'Welcome, %s' ),
							profile.firstName
						)
					: __( 'Welcome' )
			}
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

export default function AgencyOverview() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
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
			: { type: 'advisor' };

	// PROTOTYPE: the control panel can override IAR to demo tier progress.
	const influencedRevenue =
		isPrototype && prototypeSettings.influencedRevenue !== null
			? prototypeSettings.influencedRevenue
			: ( agency?.influenced_revenue ?? 0 );
	const tierLevel = getCurrentAgencyTier( tierId )?.level ?? 0;
	// PROTOTYPE: brand-new agencies (Account activated tier) don't see leads, referral, or
	// WooPayments cards yet. Agencies placed manually in a higher tier still do.
	const hideEarningsCards = experience === 'new' && tierLevel === 0;

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
				tierStrip={
					<TierStrip
						tierId={ tierId }
						influencedRevenue={ influencedRevenue }
						tiersHref="/tiers"
						recordTracksEvent={ recordTracksEvent }
					/>
				}
			/>
		) : null;
	const growthPlanCard = tailoredPlanProfile ? (
		<TailoredPlanCard
			profile={ tailoredPlanProfile }
			call={ planCall }
			tierLevel={ tierLevel }
			onScheduleCall={ scheduleCall }
			isSchedulingCall={ isSchedulingCall }
			links={ {
				partnerDirectory: PARTNER_DIRECTORY_ROUTE,
				tiers: '/tiers',
				referrals: '/referrals',
				woopayments: '/woopayments',
				wpcomHosting: getMarketplaceHostingSectionRoute( 'wpcom' ),
				pressableHosting: getMarketplaceHostingSectionRoute( 'pressable' ),
				migrations: '/migrations',
				sites: '/sites',
				team: '/agency/team',
				aiMcp: '/agency/ai',
				contactSupport: () => openContactForm(),
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
						url={ agency.url }
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
				sampleEarnings={
					isPrototype && experience === 'established'
						? {
								referrals: {
									currentQuarter: 1840,
									activeReferrals: 12,
									pendingPayout: 1265.5,
									lifetimeEarnings: 9420,
								},
								woopayments: {
									currentQuarter: 412.75,
									activeStores: 4,
									totalProcessed: 825500,
								},
							}
						: undefined
				}
				leadsCard={
					tailoredPlanProfile &&
					! hideEarningsCards && (
						<LeadsCard
							tierLevel={ tierLevel }
							influencedRevenue={ influencedRevenue }
							isListed={ hasPartnerDirectoryListing }
							profile={ tailoredPlanProfile }
							lockedNote={
								approvalStatus === 'pending'
									? __( 'Unlocks when your account is activated' )
									: undefined
							}
							links={ {
								partnerDirectory: PARTNER_DIRECTORY_ROUTE,
								migrations: '/migrations',
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
				tailoredPlan={
					tailoredPlanProfile &&
					( isPillarLayout ? (
						growthPlanCard
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
