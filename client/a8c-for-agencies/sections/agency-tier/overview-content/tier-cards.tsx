import { Badge } from '@automattic/ui';
import {
	Card,
	CardBody,
	Button,
	Modal,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { SectionHeader } from 'calypso/dashboard/components/section-header';
import { ALL_TIERS } from './constants';
import type { AgencyTierType } from './types';

export default function TierCards( {
	currentAgencyTierId,
	isSmallViewport,
	isEarlyAccess,
}: {
	currentAgencyTierId?: AgencyTierType;
	isSmallViewport: boolean;
	isEarlyAccess: boolean;
} ) {
	const currentTier = ALL_TIERS.find( ( tier ) => tier.id === currentAgencyTierId );

	const isSmallViewport = useViewportMatch( 'huge', '<' );

	const [ showEarlyAccessModal, setShowEarlyAccessModal ] = useState( false );

	const content = (
		<>
			{ ALL_TIERS.map( ( tier ) => {
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
							<VStack spacing={ 2 } style={ { flex: 1, justifyContent: 'flex-start' } }>
								<HStack>
									<SectionHeader title={ tier.name } />
									{ isCurrentTier && (
										<Badge
											style={ { minWidth: 'fit-content' } }
											intent="default"
											children={
												isEarlyAccess ? __( 'Your Tier — Early Access' ) : __( 'Your tier' )
											}
										/>
									) }
								</HStack>
								<Text style={ { color: '#757575' } }>{ tier.description }</Text>
								{ isCurrentTier && isEarlyAccess && (
									<Text style={ { color: '#757575', fontStyle: 'italic' } } weight={ 700 }>
										{ createInterpolateElement( __( 'You’re in early. <a>Learn more</a>' ), {
											a: (
												<Button onClick={ () => setShowEarlyAccessModal( true ) } variant="link">
													{ __( 'Learn more.' ) }
												</Button>
											),
										} ) }
									</Text>
								) }
								<Text style={ { color: '#757575' } } weight={ 700 }>
									{ tier.heading }
								</Text>
								<Text style={ { color: '#757575' } }>{ tier.subheading }</Text>
							</VStack>
							<Button
								href={ `#${ tier.id }` }
								variant={ isSecondary ? 'secondary' : 'primary' }
								style={ {
									marginTop: '24px',
									alignSelf: 'flex-start',
								} }
							>
								{ hasHigherTier ? __( 'See what you’ll unlock' ) : __( 'View your benefits' ) }
							</Button>
						</CardBody>
					</Card>
				);
			} ) }
			{ showEarlyAccessModal && (
				<Modal
					isDismissible
					size="medium"
					onRequestClose={ () => setShowEarlyAccessModal( false ) }
					title={ __( 'You’ve been granted early access' ) }
				>
					<VStack spacing={ 8 }>
						<Text>
							{ __(
								'You’ve been given early access to the Pro Partner tier in recognition of your partnership with Automattic. This is your head start to unlock powerful benefits, tools, and resources.'
							) }
						</Text>
						<ButtonStack justify="flex-end">
							<Button variant="primary" onClick={ () => setShowEarlyAccessModal( false ) }>
								{ __( 'Got it' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</Modal>
			) }
		</>
	);

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
