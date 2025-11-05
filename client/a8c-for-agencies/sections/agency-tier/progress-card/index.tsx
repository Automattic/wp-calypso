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
import { ALL_TIERS } from '../overview-content/constants';
import InfluencedRevenue from '../overview-content/influenced-revenue';
import type { AgencyTierType } from '../overview-content/types';

export default function AgencyTierProgressCard( {
	currentAgencyTierId,
	influencedRevenue,
	isEarlyAccess,
}: {
	currentAgencyTierId?: AgencyTierType;
	influencedRevenue: number;
	isEarlyAccess: boolean;
} ) {
	const dispatch = useDispatch();

	const currentTier = ALL_TIERS.find( ( tier ) => tier.id === currentAgencyTierId );

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
						<VStack spacing={ 3 }>
							<Heading level={ 3 } weight={ 500 }>
								{ currentTier.name }
								{ isEarlyAccess && ` (${ __( 'Early access' ) })` }
							</Heading>
							<Text color="#757575">
								{ isEarlyAccess
									? sprintf(
											/* translators: %s is the tier name */
											'You’ve been given early access to %s tier benefits. Keep up the great work!',
											currentTier.name
									  )
									: currentTier.progressCardDescription }
							</Text>
							<InfluencedRevenue
								currentAgencyTierId={ currentAgencyTierId }
								totalInfluencedRevenue={ influencedRevenue }
							/>
							<ButtonStack justify="flex-start">
								<Button
									onClick={ handleExploreTiersAndBenefits }
									href={ A4A_AGENCY_TIER_LINK }
									variant="secondary"
								>
									{ __( 'Explore Tiers and benefits' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		</Spacer>
	);
}
