import { formatCurrency } from '@automattic/number-formatters';
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
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { SectionHeader } from 'calypso/dashboard/components/section-header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { ALL_TIERS } from './constants';
import type { AgencyTierType } from './types';

export default function TierCards( {
	currentAgencyTierId,
	isEarlyAccess,
}: {
	currentAgencyTierId?: AgencyTierType;
	isEarlyAccess: boolean;
} ) {
	const dispatch = useDispatch();

	const currentTier = ALL_TIERS.find( ( tier ) => tier.id === currentAgencyTierId );

	const isSmallViewport = useViewportMatch( 'huge', '<' );

	const [ showEarlyAccessModal, setShowEarlyAccessModal ] = useState( false );

	const handleLearnMore = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agency_tier_early_access_learn_more_click', {
				agency_tier: currentAgencyTierId,
			} )
		);
		setShowEarlyAccessModal( true );
	};

	const handleViewBenefits = ( tierId: string ) => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agency_tier_view_benefits_click', {
				agency_tier: currentAgencyTierId,
			} )
		);

		const element = document.getElementById( tierId );
		if ( element ) {
			element.scrollIntoView( { behavior: 'smooth' } );
		}
	};

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
									{ isCurrentTier && ! isEarlyAccess && (
										<Badge
											style={ { minWidth: 'fit-content' } }
											intent="default"
											children={ __( 'Your tier' ) }
										/>
									) }
								</HStack>
								{ isCurrentTier && isEarlyAccess && (
									<Badge
										style={ { width: 'fit-content' } }
										intent="default"
										children={ __( 'Your Tier — Early Access' ) }
									/>
								) }
								<Text style={ { color: '#757575' } }>{ tier.description }</Text>
								{ isCurrentTier && isEarlyAccess && (
									<Text style={ { color: '#757575', fontStyle: 'italic' } } weight={ 700 }>
										{ createInterpolateElement( __( 'You’re in early. <a>Learn more</a>' ), {
											a: (
												<Button onClick={ handleLearnMore } variant="link">
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
								onClick={ () => handleViewBenefits( tier.id as string ) }
								variant={ isSecondary ? 'secondary' : 'primary' }
								style={ { marginTop: '24px', alignSelf: 'flex-start' } }
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
						<Text>
							{ createInterpolateElement(
								sprintf(
									/* translators: %s is the influenced revenue */
									__(
										'To make the most of your early access and stay on track toward your %s Influenced Automattic Revenue goal, <b>stay connected with your Partner Manager</b>. Your manager is here to help you reach that goal by providing strategic guidance, growth opportunities, and ensure you maximize every advantage during this phase.'
									),
									formatCurrency( 5000, 'USD' )
								),
								{
									b: <strong />,
								}
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
