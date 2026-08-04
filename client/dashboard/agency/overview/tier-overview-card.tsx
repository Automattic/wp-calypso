import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { published } from '@wordpress/icons';
import OverviewCard from '../../components/overview-card';
import { Text } from '../../components/text';
import getCurrentAgencyTier from '../tiers/get-current-agency-tier';
import InfluencedRevenue from '../tiers/influenced-revenue';
import { TIER_OVERVIEW_CONTENT } from './constants';
import type { AgencyTierType, RecordTracksEvent } from '../tiers/types';
import type { ReactNode } from 'react';

interface TierOverviewCardProps {
	tierId?: AgencyTierType;
	influencedRevenue: number;
	tiersHref: string;
	useRouterLink?: boolean;
	onScheduleCall?: () => void;
	isSchedulingCall?: boolean;
	recordTracksEvent?: RecordTracksEvent;
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

export default function TierOverviewCard( {
	tierId,
	influencedRevenue,
	tiersHref,
	useRouterLink,
	onScheduleCall,
	isSchedulingCall,
	recordTracksEvent,
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
							title={ __( 'Learn how to grow with Automattic.' ) }
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
