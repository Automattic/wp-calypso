import {
	Button,
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { commentAuthorAvatar, published } from '@wordpress/icons';
import { useState } from 'react';
import OverviewCard from '../../components/overview-card';
import { Text } from '../../components/text';
import getCurrentAgencyTier from '../tiers/get-current-agency-tier';
import InfluencedRevenue from '../tiers/influenced-revenue';
import { TIER_OVERVIEW_CONTENT } from './constants';
import type { AgencyTierType, RecordTracksEvent } from '../tiers/types';
import type { AgencyPartnerManager } from '@automattic/api-core';
import type { ReactNode } from 'react';

interface TierOverviewCardProps {
	tierId?: AgencyTierType;
	influencedRevenue: number;
	tiersHref: string;
	shouldUseRouterLink?: boolean;
	onScheduleCall?: () => void;
	isSchedulingCall?: boolean;
	recordTracksEvent?: RecordTracksEvent;
	/** Agencies without an assigned partner manager get the generic copy. */
	partnerManager?: AgencyPartnerManager | null;
}

const AVATAR_SIZE = 32;

// Keep the fallback the same size as the photo so the row height is stable.
function PartnerManagerAvatar( { avatarUrl }: { avatarUrl?: string | null } ) {
	const [ hasFailed, setHasFailed ] = useState( false );

	if ( ! avatarUrl || hasFailed ) {
		return <Icon icon={ commentAuthorAvatar } size={ AVATAR_SIZE } />;
	}

	return (
		<img
			src={ avatarUrl }
			alt=""
			width={ AVATAR_SIZE }
			height={ AVATAR_SIZE }
			style={ { borderRadius: '50%', flexShrink: 0 } }
			onError={ () => setHasFailed( true ) }
		/>
	);
}

function PartnerManagerTitle( { partnerManager }: { partnerManager: AgencyPartnerManager } ) {
	return (
		<HStack spacing={ 3 } justify="flex-start" alignment="center" expanded={ false }>
			<PartnerManagerAvatar avatarUrl={ partnerManager.avatar_url } />
			<VStack spacing={ 0 }>
				<Text size={ 13 } weight={ 500 } lineHeight="20px">
					{ partnerManager.name }
				</Text>
				<Text variant="muted" size={ 12 } lineHeight="16px">
					{ __( 'Get strategic guidance from your partner manager.' ) }
				</Text>
			</VStack>
		</HStack>
	);
}

function TierFooterSection( {
	label,
	title,
	action,
}: {
	label: string;
	title: ReactNode;
	action: ReactNode;
} ) {
	return (
		<VStack spacing={ 2 }>
			<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
				{ label }
			</Text>
			<HStack justify="space-between" alignment="center" wrap>
				{ typeof title === 'string' ? (
					<Text size={ 13 } lineHeight="20px">
						{ title }
					</Text>
				) : (
					title
				) }
				{ action }
			</HStack>
		</VStack>
	);
}

export default function TierOverviewCard( {
	tierId,
	influencedRevenue,
	tiersHref,
	shouldUseRouterLink,
	onScheduleCall,
	isSchedulingCall,
	recordTracksEvent,
	partnerManager,
}: TierOverviewCardProps ) {
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
			shouldUseRouterLink={ shouldUseRouterLink }
			tracksId="agency-overview-tier"
			onClick={ () =>
				recordTracksEvent?.( 'calypso_a4a_agency_tier_progress_card_explore_click', {
					agency_tier: tierId,
				} )
			}
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
							title={ __( 'Learn how to grow with Automattic.' ) }
							action={
								<Button
									size="compact"
									variant="primary"
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
							title={
								partnerManager ? (
									<PartnerManagerTitle partnerManager={ partnerManager } />
								) : (
									__( 'Get strategic guidance from your dedicated partner manager.' )
								)
							}
							action={
								<Button
									size="compact"
									variant="primary"
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
