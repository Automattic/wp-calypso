import { Badge } from '@automattic/ui';
import {
	Card,
	CardBody,
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { SectionHeader } from 'calypso/dashboard/components/section-header';
import { ALL_TIERS } from './constants';
import type { AgencyTierType } from './types';

export default function TierCards( {
	currentAgencyTierId,
}: {
	currentAgencyTierId?: AgencyTierType;
} ) {
	const currentTier = ALL_TIERS.find( ( tier ) => tier.id === currentAgencyTierId );

	const isSmallViewport = useViewportMatch( 'huge', '<' );

	const content = ALL_TIERS.map( ( tier ) => {
		const hasLowerTier = currentTier && currentTier.level > tier.level;
		const hasHigherTier = currentTier && currentTier.level < tier.level;
		const isCurrentTier = currentTier === tier;
		const isSecondary = hasLowerTier || hasHigherTier;

		return (
			<Card
				key={ tier.id }
				style={ {
					width: isSmallViewport ? '100%' : '33%',
					...( isCurrentTier && {
						boxShadow: '0 0 0 1px var(--color-primary-50)',
					} ),
				} }
			>
				<CardBody style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
					<VStack spacing={ 2 } style={ { flex: 1 } }>
						<HStack>
							<SectionHeader title={ tier.name } />
							{ isCurrentTier && (
								<Badge
									style={ { minWidth: 'fit-content' } }
									intent="default"
									children={ __( 'Your tier' ) }
								/>
							) }
						</HStack>
						<Text style={ { color: '#757575' } }>{ tier.description }</Text>
						<Text style={ { color: '#757575' } } weight={ 700 }>
							{ tier.heading }
						</Text>
						<Text style={ { color: '#757575' } }>{ tier.subheading }</Text>
					</VStack>
					<Button
						href={ `#${ tier.id }` }
						variant={ isSecondary ? 'secondary' : 'primary' }
						style={ { marginTop: '24px', alignSelf: 'flex-start' } }
					>
						{ hasHigherTier ? __( 'See what you’ll unlock' ) : __( 'View your benefits' ) }
					</Button>
				</CardBody>
			</Card>
		);
	} );

	if ( isSmallViewport ) {
		return (
			<VStack spacing={ 6 } style={ { alignItems: 'center' } }>
				{ content }
			</VStack>
		);
	}

	return (
		<HStack spacing={ 6 } style={ { justifyContent: 'space-between' } } alignment="stretch">
			{ content }
		</HStack>
	);
}
