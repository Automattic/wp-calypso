import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { published } from '@wordpress/icons';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { caution } from '../../components/notice/icons';
import OverviewCard from '../../components/overview-card';
import { Text } from '../../components/text';
import getCurrentAgencyTier from '../tiers/get-current-agency-tier';
import InfluencedRevenue from '../tiers/influenced-revenue';
import { PARTNER_PROGRAM_GUIDE_URL, TIER_OVERVIEW_CONTENT } from './constants';
import NewTabLabel from './new-tab-label';
import type { AgencyTierType, RecordTracksEvent } from '../tiers/types';
import type { ReactNode } from 'react';

interface TierOverviewCardProps {
	tierId?: AgencyTierType;
	influencedRevenue: number;
	isPending: boolean;
	isRejected: boolean;
	tiersHref: string;
	contactSupportHref: string;
	useRouterLink?: boolean;
	onScheduleCall?: () => void;
	isSchedulingCall?: boolean;
	onRelaunchTour?: () => void;
	recordTracksEvent?: RecordTracksEvent;
}

function ApplicationStatusCard( {
	decoration,
	label,
	heading,
	children,
}: {
	decoration: ReactNode;
	label: string;
	heading: string;
	children: ReactNode;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
						{ decoration }
						<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
							{ label }
						</Text>
					</HStack>
					<VStack spacing={ 2 }>
						<Text size={ 20 } weight={ 500 } lineHeight="24px" as="h2">
							{ heading }
						</Text>
						{ children }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

function TierFooterSection( {
	label,
	title,
	action,
}: {
	label: string;
	title: string;
	action: ReactNode;
} ) {
	return (
		<VStack spacing={ 2 }>
			<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
				{ label }
			</Text>
			<HStack justify="space-between" alignment="center">
				<Text lineHeight="20px">{ title }</Text>
				{ action }
			</HStack>
		</VStack>
	);
}

function PendingTierCard( {
	onRelaunchTour,
	recordTracksEvent,
}: {
	onRelaunchTour?: () => void;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	return (
		<ApplicationStatusCard
			decoration={
				<Icon icon={ published } size={ 24 } style={ { fill: 'var(--wp-admin-theme-color)' } } />
			}
			label={ __( 'Welcome' ) }
			heading={ __( 'We’re reviewing your account' ) }
		>
			<Text variant="muted" lineHeight="20px">
				{ __(
					'While we review, you can’t make purchases yet, but feel free to explore the tools and set up your agency profile. Most are activated within one business day.'
				) }
			</Text>
			<ButtonStack justify="flex-start" style={ { paddingTop: '8px' } }>
				<Button
					size="compact"
					variant="primary"
					href={ PARTNER_PROGRAM_GUIDE_URL }
					target="_blank"
					rel="noreferrer"
					onClick={ () =>
						recordTracksEvent?.( 'calypso_a4a_overview_tier_card_program_guide_click' )
					}
				>
					<NewTabLabel>{ __( 'Read the partner program guide' ) }</NewTabLabel>
				</Button>
				{ onRelaunchTour && (
					<Button
						size="compact"
						variant="tertiary"
						onClick={ () => {
							recordTracksEvent?.( 'calypso_a4a_overview_relaunch_welcome_tour_click' );
							onRelaunchTour();
						} }
					>
						{ __( 'Relaunch welcome tour' ) }
					</Button>
				) }
			</ButtonStack>
		</ApplicationStatusCard>
	);
}

function RejectedTierCard( { contactSupportHref }: { contactSupportHref: string } ) {
	return (
		<ApplicationStatusCard
			decoration={
				<Text intent="error" as="span">
					<Icon icon={ caution } size={ 24 } fill="currentColor" />
				</Text>
			}
			label={ __( 'Application status' ) }
			heading={ __( 'Your application wasn’t approved' ) }
		>
			<Text variant="muted" lineHeight="20px">
				{ __( 'We have not approved your application for the Automattic for Agencies program.' ) }
			</Text>
			<Text variant="muted" lineHeight="20px">
				{ createInterpolateElement(
					__(
						'Please <a>contact support</a> to discuss this further if you think this was done in error.'
					),
					{ a: <a href={ contactSupportHref } /> }
				) }
			</Text>
		</ApplicationStatusCard>
	);
}

export default function TierOverviewCard( {
	tierId,
	influencedRevenue,
	isPending,
	isRejected,
	tiersHref,
	contactSupportHref,
	useRouterLink,
	onScheduleCall,
	isSchedulingCall,
	onRelaunchTour,
	recordTracksEvent,
}: TierOverviewCardProps ) {
	if ( isRejected ) {
		return <RejectedTierCard contactSupportHref={ contactSupportHref } />;
	}

	if ( isPending ) {
		return (
			<PendingTierCard onRelaunchTour={ onRelaunchTour } recordTracksEvent={ recordTracksEvent } />
		);
	}

	const tier = getCurrentAgencyTier( tierId );
	if ( ! tier ) {
		return null;
	}

	const content = TIER_OVERVIEW_CONTENT[ tier.id ];
	const showAdvisorCall = tier.level === 0 && !! onScheduleCall;
	const showPartnerManager = content.hasPartnerManager && !! onScheduleCall;

	return (
		<OverviewCard
			icon={ published }
			title={ __( 'Your agency tier' ) }
			heading={ tier.name }
			description={ content.description }
			link={ tiersHref }
			useRouterLink={ useRouterLink }
			tracksId="agency-overview-tier"
			bottom={
				<VStack spacing={ 4 }>
					<InfluencedRevenue
						currentAgencyTierId={ tierId }
						totalInfluencedRevenue={ influencedRevenue }
						recordTracksEvent={ recordTracksEvent }
					/>
					{ showAdvisorCall && (
						<TierFooterSection
							label={ __( 'Your free advisor call' ) }
							title={ __( 'Learn how to grow with Automattic' ) }
							action={
								<Button
									size="compact"
									variant="secondary"
									isBusy={ isSchedulingCall }
									onClick={ () => {
										recordTracksEvent?.( 'calypso_a4a_overview_tier_card_schedule_call_click', {
											agency_tier: tier.id,
										} );
										onScheduleCall?.();
									} }
								>
									{ __( 'Schedule your 30 minute advisor call' ) }
								</Button>
							}
						/>
					) }
					{ showPartnerManager && (
						<TierFooterSection
							label={ __( 'Your partner manager' ) }
							title={ __( 'Get strategic guidance from your dedicated partner manager.' ) }
							action={
								<Button
									size="compact"
									variant="secondary"
									isBusy={ isSchedulingCall }
									onClick={ () => {
										recordTracksEvent?.(
											'calypso_a4a_overview_partner_manager_schedule_call_click',
											{ agency_tier: tier.id }
										);
										onScheduleCall?.();
									} }
								>
									{ __( 'Schedule a check-in' ) }
								</Button>
							}
						/>
					) }
				</VStack>
			}
		/>
	);
}
