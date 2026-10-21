import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { Text } from '../../components/text';
import { ALL_TIERS } from '../tiers/constants';
import { TIER_ORDER } from './constants';
import { getDiscount } from './use-certification';
import type { AgencyTierId } from '@automattic/api-core';

export default function TierDiscountList( {
	currentTierId,
	isPromo,
}: {
	currentTierId: AgencyTierId;
	isPromo: boolean;
} ) {
	return (
		<VStack
			as="ul"
			role="list"
			spacing={ 3 }
			style={ { margin: 0, padding: 0, listStyle: 'none' } }
		>
			{ TIER_ORDER.map( ( tierId ) => {
				const tier = ALL_TIERS.find( ( { id } ) => id === tierId );
				const isCurrent = tierId === currentTierId;
				return (
					<HStack as="li" key={ tierId } justify="space-between" alignment="center">
						<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
							<Text size={ 13 } weight={ isCurrent ? 500 : 400 } lineHeight="20px">
								{ tier?.name }
							</Text>
							{ isCurrent && <Badge intent="informational">{ __( 'Your tier' ) }</Badge> }
						</HStack>
						<Text
							size={ 13 }
							weight={ isCurrent ? 500 : 400 }
							lineHeight="20px"
							variant={ isCurrent ? undefined : 'muted' }
						>
							{ sprintf(
								/* translators: %d is a percentage discount */
								__( '%d%% off' ),
								getDiscount( tierId, isPromo )
							) }
						</Text>
					</HStack>
				);
			} ) }
		</VStack>
	);
}
