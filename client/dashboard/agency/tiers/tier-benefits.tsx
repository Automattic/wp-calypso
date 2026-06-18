import { Badge } from '@automattic/ui';
import {
	Button,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { Fragment } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { ALL_TIERS } from './constants';
import getCurrentAgencyTier from './get-current-agency-tier';
import type { AgencyTierType, Benefit, RecordTracksEvent } from './types';
import type { Button as ButtonComponent } from '@wordpress/components';
import type { ComponentProps, ReactNode } from 'react';

function BenefitRow( {
	benefit,
	isLocked,
	isSmallViewport,
	recordTracksEvent,
	onScheduleCall,
	isSchedulingCall,
	currentAgencyTierId,
	renderDownloadBadges,
}: {
	benefit: Benefit;
	isLocked: boolean;
	isSmallViewport: boolean;
	recordTracksEvent: RecordTracksEvent;
	onScheduleCall: () => void;
	isSchedulingCall?: boolean;
	currentAgencyTierId?: AgencyTierType;
	renderDownloadBadges?: ( buttonProps: ComponentProps< typeof ButtonComponent > ) => ReactNode;
} ) {
	const renderActions = () => {
		// Locked (higher) tiers don't expose actions yet.
		if ( isLocked || ! benefit.actions ) {
			return null;
		}

		const buttonProps = {
			size: ( isSmallViewport ? 'default' : 'small' ) as ComponentProps<
				typeof ButtonComponent
			>[ 'size' ],
			variant: ( isSmallViewport ? 'secondary' : 'tertiary' ) as ComponentProps<
				typeof ButtonComponent
			>[ 'variant' ],
		};

		const buttons = benefit.actions.map( ( action ) => {
			if ( action.id === 'download-badge' ) {
				return renderDownloadBadges ? (
					<span key={ action.id }>{ renderDownloadBadges( buttonProps ) }</span>
				) : null;
			}
			if ( action.id === 'schedule-call' ) {
				return (
					<Button
						{ ...buttonProps }
						key={ action.id }
						onClick={ onScheduleCall }
						isBusy={ isSchedulingCall }
						disabled={ isSchedulingCall }
					>
						{ action.label }
					</Button>
				);
			}
			if ( action.href ) {
				return (
					<Button
						{ ...buttonProps }
						key={ action.id }
						href={ action.href }
						onClick={ () =>
							recordTracksEvent( 'calypso_a4a_agency_tier_benefits_action_click', {
								agency_tier: currentAgencyTierId,
								action_id: action.id,
							} )
						}
					>
						{ action.label }
					</Button>
				);
			}
			return null;
		} );

		if ( isSmallViewport ) {
			return (
				<VStack spacing={ 2 } style={ { paddingBlockStart: '8px', width: '100%' } }>
					{ buttons }
				</VStack>
			);
		}
		return (
			<HStack spacing={ 2 } justify="flex-start" style={ { paddingBlockStart: '8px' } }>
				{ buttons }
			</HStack>
		);
	};

	return (
		<HStack spacing={ 4 } alignment="flex-start" justify="flex-start">
			{ ! isSmallViewport && (
				<div
					aria-hidden="true"
					style={ {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
						width: '48px',
						height: '48px',
						borderRadius: '4px',
						background: 'var(--color-gray-100)',
						color: 'var(--color-gray-700)',
						opacity: isLocked ? 0.5 : undefined,
					} }
				>
					<Icon icon={ benefit.icon } size={ 28 } />
				</div>
			) }
			<VStack spacing={ 2 } style={ { flexGrow: 1 } }>
				<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
					<Text weight={ 500 } variant={ isLocked ? 'muted' : undefined }>
						{ benefit.title }
					</Text>
					{ benefit.status && <Badge intent="default" children={ benefit.status } /> }
				</HStack>
				<Text size={ 12 } variant="muted">
					{ benefit.description }
				</Text>
				{ renderActions() }
			</VStack>
		</HStack>
	);
}

export default function TierBenefits( {
	currentAgencyTierId,
	recordTracksEvent = () => {},
	onScheduleCall,
	isSchedulingCall,
	renderDownloadBadges,
}: {
	currentAgencyTierId?: AgencyTierType;
	recordTracksEvent?: RecordTracksEvent;
	onScheduleCall: () => void;
	isSchedulingCall?: boolean;
	renderDownloadBadges?: ( buttonProps: ComponentProps< typeof ButtonComponent > ) => ReactNode;
} ) {
	const currentTier = getCurrentAgencyTier( currentAgencyTierId );

	const isSmallViewport = useViewportMatch( 'large', '<' );
	const isMediumViewport = useViewportMatch( 'huge', '<' );

	if ( ! currentTier ) {
		return null;
	}

	// Rearrange tiers: current first, then lower tiers, then higher tiers.
	const lowerTiers = ALL_TIERS.filter( ( tier ) => tier.level < currentTier.level ).sort(
		( a, b ) => b.level - a.level
	);
	const higherTiers = ALL_TIERS.filter( ( tier ) => tier.level > currentTier.level ).sort(
		( a, b ) => a.level - b.level
	);
	const allTiersToShow = [ currentTier, ...lowerTiers, ...higherTiers ];

	return (
		<VStack spacing={ 6 } style={ { alignItems: 'center' } }>
			{ allTiersToShow.map( ( tier ) => {
				const isCurrentTier = tier.id === currentAgencyTierId;
				const isLowerTier = tier.level < currentTier.level;
				const isHigherTier = tier.level > currentTier.level;

				let tierHeading: string;
				if ( tier.id === 'emerging-partner' ) {
					tierHeading = __( 'Your essential benefits' );
				} else if ( isCurrentTier || isLowerTier ) {
					tierHeading = sprintf(
						/* translators: %s is the agency tier name */
						__( 'Your %s benefits' ),
						tier.name
					);
				} else {
					tierHeading = sprintf(
						/* translators: %s is the agency tier name */
						__( 'What you’ll unlock when you become a %s' ),
						tier.name
					);
				}

				return (
					<Card
						id={ tier.id }
						key={ tier.id }
						style={ {
							width: isMediumViewport ? '100%' : '50%',
							minWidth: isMediumViewport ? 'unset' : '600px',
						} }
					>
						<CardHeader isBorderless>
							<SectionHeader title={ tierHeading } level={ 3 } />
						</CardHeader>
						{ tier.benefits.map( ( benefit, index ) => (
							<Fragment key={ benefit.title }>
								{ index > 0 && <CardDivider style={ { borderColor: 'var(--color-gray-100)' } } /> }
								<CardBody>
									<BenefitRow
										benefit={ benefit }
										isLocked={ isHigherTier }
										isSmallViewport={ isSmallViewport }
										recordTracksEvent={ recordTracksEvent }
										onScheduleCall={ onScheduleCall }
										isSchedulingCall={ isSchedulingCall }
										currentAgencyTierId={ currentAgencyTierId }
										renderDownloadBadges={ renderDownloadBadges }
									/>
								</CardBody>
							</Fragment>
						) ) }
					</Card>
				);
			} ) }
		</VStack>
	);
}
