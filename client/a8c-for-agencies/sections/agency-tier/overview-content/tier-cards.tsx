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
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentAgencyTier from '../lib/get-current-agency-tier';
import { ALL_TIERS, TARGET_INFLUENCED_REVENUE } from './constants';
import type { AgencyTierType } from './types';
import type { AgencyTierStatus } from 'calypso/state/a8c-for-agencies/types';

const TEXT_COLOR = 'var(--color-gray-700)';

export default function TierCards( {
	currentAgencyTierId,
	tierStatus,
}: {
	currentAgencyTierId?: AgencyTierType;
	tierStatus?: AgencyTierStatus;
} ) {
	const dispatch = useDispatch();

	const currentTier = getCurrentAgencyTier( currentAgencyTierId );

	const isSmallViewport = useViewportMatch( 'wide', '<' );

	const [ showEarlyAccessModal, setShowEarlyAccessModal ] = useState( false );
	const [ showTierProtectedModal, setShowTierProtectedModal ] = useState( false );

	const handleViewEarlyAccessInfo = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agency_tier_early_access_learn_more_click', {
				agency_tier: currentAgencyTierId,
			} )
		);
		setShowEarlyAccessModal( true );
	};

	const handleViewTierProtectedInfo = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agency_tier_tier_protected_learn_more_click', {
				agency_tier: currentAgencyTierId,
			} )
		);
		setShowTierProtectedModal( true );
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

	const isEarlyAccess = tierStatus === 'early_access';
	const isTierProtected = tierStatus === 'tier_protected';

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
							width: '100%',
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							...( isCurrentTier && {
								boxShadow: '0 0 0 1px var(--color-primary-50)',
							} ),
						} }
					>
						<CardBody style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
							<VStack spacing={ 1 } style={ { flex: 1, justifyContent: 'flex-start' } }>
								<HStack style={ { marginBlockEnd: '4px' } }>
									<Heading level={ 3 } weight={ 500 }>
										{ tier.name }
									</Heading>
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
										children={ __( 'Your tier — Early Access' ) }
									/>
								) }
								<Text color={ TEXT_COLOR }>{ tier.description }</Text>
								{ isCurrentTier && isEarlyAccess && (
									<Text color={ TEXT_COLOR } style={ { fontStyle: 'italic' } } weight={ 700 }>
										{ createInterpolateElement( __( 'You’re in early. <a>Learn more</a>' ), {
											a: (
												<Button onClick={ handleViewEarlyAccessInfo } variant="link">
													{ __( 'Learn more.' ) }
												</Button>
											),
										} ) }
									</Text>
								) }
								{ isCurrentTier && isTierProtected && (
									<Text color={ TEXT_COLOR } style={ { fontStyle: 'italic' } } weight={ 700 }>
										{ createInterpolateElement(
											__( 'Your tier level is protected. <a>Learn more</a>' ),
											{
												a: (
													<Button onClick={ handleViewTierProtectedInfo } variant="link">
														{ __( 'Learn more.' ) }
													</Button>
												),
											}
										) }
									</Text>
								) }
							</VStack>
							<VStack
								spacing={ 1 }
								style={ { flex: 1, justifyContent: 'flex-start', marginBlockStart: '8px' } }
							>
								<Text color={ TEXT_COLOR } weight={ 700 }>
									{ tier.heading }
								</Text>
								<Text color={ TEXT_COLOR }>{ tier.subheading }</Text>
							</VStack>
							<Button
								onClick={ () => handleViewBenefits( tier.id as string ) }
								variant={ isSecondary ? 'secondary' : 'primary' }
								style={ { marginBlockStart: '24px', alignSelf: 'flex-start' } }
							>
								{ hasHigherTier ? __( 'See what you’ll unlock' ) : __( 'View your benefits' ) }
							</Button>
						</CardBody>
					</Card>
				);
			} ) }
			{ showEarlyAccessModal && currentTier && (
				<Modal
					isDismissible
					size="medium"
					onRequestClose={ () => setShowEarlyAccessModal( false ) }
					title={ __( 'You’ve been granted early access' ) }
				>
					<VStack spacing={ 8 }>
						<Text>
							{ sprintf(
								/* translators: %s is the tier name */
								__(
									'You’ve been given early access to the %s tier in recognition of your partnership with Automattic. This is your head start to unlock powerful benefits, tools, and resources.'
								),
								currentTier.name
							) }
						</Text>
						<Text>
							{ createInterpolateElement(
								sprintf(
									/* translators: %s is the influenced revenue */
									__(
										'To make the most of your early access and stay on track toward your %s Influenced Automattic Revenue goal, <b>stay connected with your Partner Manager</b>. Your manager is here to help you reach that goal by providing strategic guidance, growth opportunities, and ensure you maximize every advantage during this phase.'
									),
									formatCurrency( TARGET_INFLUENCED_REVENUE[ currentTier.id ], 'USD' )
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
			{ showTierProtectedModal && currentTier && (
				<Modal
					isDismissible
					size="medium"
					onRequestClose={ () => setShowTierProtectedModal( false ) }
					title={ __( 'Your tier level is protected' ) }
				>
					<VStack spacing={ 8 }>
						<Text>
							{ sprintf(
								/* translators: %s is the tier name */
								__(
									'You earned the %s tier in the previous year, and your tier level is protected for the current year. This means you will not be downgraded during this year, regardless of your current influenced revenue.'
								),
								currentTier.name
							) }
						</Text>
						<Text>
							{ __(
								'You can still move up to a higher tier if your influenced revenue qualifies. However, if you do not meet the minimum requirements for this tier, any downgrade will only occur when the next year’s cycle begins in January. This protection ensures you can continue to enjoy your current tier benefits throughout the year.'
							) }
						</Text>
						<ButtonStack justify="flex-end">
							<Button variant="primary" onClick={ () => setShowTierProtectedModal( false ) }>
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
		<div
			style={ {
				display: 'grid',
				gridTemplateColumns: 'repeat(3, 1fr)',
				gridAutoRows: '1fr',
				gap: '24px',
				alignItems: 'stretch',
			} }
		>
			{ content }
		</div>
	);
}
