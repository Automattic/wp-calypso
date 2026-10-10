/**
 * PROTOTYPE — proof of concept only.
 *
 * Compact agency tier summary shown at the top of the partner manager card,
 * in place of the full tier card, for established agencies.
 */
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { published } from '@wordpress/icons';
import { Text } from '../../../components/text';
import getCurrentAgencyTier from '../../tiers/get-current-agency-tier';
import InfluencedRevenue from '../../tiers/influenced-revenue';
import OverviewLinkButton from '../overview-link-button';
import type { AgencyTierType, RecordTracksEvent } from '../../tiers/types';

interface TierStripProps {
	tierId?: AgencyTierType;
	influencedRevenue: number;
	tiersHref: string;
	shouldUseRouterLink?: boolean;
	recordTracksEvent?: RecordTracksEvent;
}

export default function TierStrip( {
	tierId,
	influencedRevenue,
	tiersHref,
	shouldUseRouterLink,
	recordTracksEvent,
}: TierStripProps ) {
	const tier = getCurrentAgencyTier( tierId );
	if ( ! tier ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			<HStack justify="space-between" alignment="center">
				<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
					<Icon icon={ published } size={ 24 } style={ { fill: 'var(--wp-admin-theme-color)' } } />
					<VStack spacing={ 0 }>
						<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
							{ __( 'Your agency tier' ) }
						</Text>
						<Text size={ 15 } weight={ 500 } lineHeight="20px">
							{ tier.name }
						</Text>
					</VStack>
				</HStack>
				<OverviewLinkButton
					size="compact"
					variant="tertiary"
					href={ tiersHref }
					shouldUseRouterLink={ shouldUseRouterLink }
				>
					{ __( 'View benefits' ) }
				</OverviewLinkButton>
			</HStack>
			<InfluencedRevenue
				currentAgencyTierId={ tierId }
				totalInfluencedRevenue={ influencedRevenue }
				recordTracksEvent={ recordTracksEvent }
			/>
		</VStack>
	);
}
