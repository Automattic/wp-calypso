import { Badge } from '@automattic/ui';
import {
	Card,
	CardBody,
	Button,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { A4A_AGENCY_TIER_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentAgencyTier from '../lib/get-current-agency-tier';
import InfluencedRevenue from '../overview-content/influenced-revenue';
import type { AgencyTierType } from '../overview-content/types';
import type { AgencyTierStatus } from 'calypso/state/a8c-for-agencies/types';

function getTierCtaLabel( tierId?: AgencyTierType ): string {
	const labels: Record< AgencyTierType, string > = {
		'emerging-partner': __( 'See how to grow' ),
		'agency-partner': __( 'Unlock Pro tier' ),
		'pro-agency-partner': __( 'Explore Pro perks' ),
		'vip-pro-agency-partner': __( 'View my credits' ),
		'premier-partner': __( 'View my benefits' ),
	};

	return tierId ? labels[ tierId ] : __( 'View tiers' );
}

export default function AgencyTierProgressCard( {
	currentAgencyTierId,
	influencedRevenue,
	tierStatus,
}: {
	currentAgencyTierId?: AgencyTierType;
	influencedRevenue: number;
	tierStatus?: AgencyTierStatus;
} ) {
	const dispatch = useDispatch();

	const currentTier = getCurrentAgencyTier( currentAgencyTierId );

	if ( ! currentTier ) {
		return null;
	}

	const handleExploreTiersAndBenefits = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agency_tier_progress_card_explore_click', {
				agency_tier: currentAgencyTierId,
			} )
		);
	};

	return (
		<Spacer marginBottom={ 4 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Heading level={ 4 } weight={ 500 }>
							{ __( 'Your agency tier and benefits' ) }
						</Heading>
						<VStack spacing={ 1 }>
							{ tierStatus === 'early_access' && (
								<Badge
									style={ { width: 'fit-content', marginBottom: '4px' } }
									intent="default"
									children={ __( 'Early access' ) }
								/>
							) }
							{ tierStatus === 'tier_protected' && (
								<Badge
									style={ { width: 'fit-content', marginBottom: '4px' } }
									intent="default"
									children={ __( 'Tier-level protected' ) }
								/>
							) }
							<Heading level={ 3 } weight={ 500 }>
								{ currentTier.name }
							</Heading>
							<Text color="#757575">
								{ tierStatus === 'early_access'
									? sprintf(
											/* translators: %s is the tier name */
											'You’ve been given early access to %s tier benefits. Keep up the great work!',
											currentTier.name
									  )
									: currentTier.progressCardDescription }
							</Text>
						</VStack>
						<InfluencedRevenue
							currentAgencyTierId={ currentAgencyTierId }
							totalInfluencedRevenue={ influencedRevenue }
						/>
						<ButtonStack justify="flex-start">
							<Button
								className="agency-tier__progress-card-cta-button"
								onClick={ handleExploreTiersAndBenefits }
								href={ A4A_AGENCY_TIER_LINK }
								variant="secondary"
							>
								{ getTierCtaLabel( currentAgencyTierId ) }
							</Button>
						</ButtonStack>
					</VStack>
				</CardBody>
			</Card>
		</Spacer>
	);
}
