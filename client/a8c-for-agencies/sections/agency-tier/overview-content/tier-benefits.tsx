import { Badge } from '@automattic/ui';
import {
	Card,
	CardHeader,
	CardBody,
	Icon,
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { DataViews } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import useScheduleCall from 'calypso/a8c-for-agencies/hooks/use-schedule-call';
import { SectionHeader } from 'calypso/dashboard/components/section-header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import DownloadBadges from '../download-badges';
import getCurrentAgencyTier from '../lib/get-current-agency-tier';
import { ALL_TIERS } from './constants';
import type { AgencyTierType, Benefit } from './types';
import type { Field } from '@wordpress/dataviews';
import type { ComponentProps } from 'react';

import './style.scss';

export default function TierBenefits( {
	currentAgencyTierId,
}: {
	currentAgencyTierId?: AgencyTierType;
} ) {
	const dispatch = useDispatch();

	const currentTier = getCurrentAgencyTier( currentAgencyTierId );

	const isSmallViewport = useViewportMatch( 'large', '<' );
	const isMediumViewport = useViewportMatch( 'huge', '<' );

	const { scheduleCall, isLoading } = useScheduleCall();

	const handleScheduleCall = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agency_tier_benefits_schedule_call_click', {
				agency_tier: currentAgencyTierId,
			} )
		);
		scheduleCall();
	};

	const handleActionClick = ( actionId: string ) => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_agency_tier_benefits_action_click', {
				agency_tier: currentAgencyTierId,
				action_id: actionId,
			} )
		);
	};

	if ( ! currentTier ) {
		return null;
	}

	// Rearrange tiers: lower tiers first (except emerging-partner), then current tier, then higher tiers
	const lowerTiers = ALL_TIERS.filter( ( tier ) => tier.level < currentTier.level ).sort(
		( a, b ) => b.level - a.level
	);
	const higherTiers = ALL_TIERS.filter( ( tier ) => tier.level > currentTier.level ).sort(
		( a, b ) => a.level - b.level
	);

	// Combine all tiers in the desired order
	const allTiersToShow = [ currentTier, ...lowerTiers, ...higherTiers ];

	const fields: Field< Benefit >[] = [
		{
			id: 'icon',
			render: ( { item } ) =>
				item.icon ? (
					<div className="agency-tier-overview-revamped__icon-container">
						<Icon icon={ item.icon } size={ 32 } />
					</div>
				) : null,
		},
		{
			id: 'title',
			getValue: ( { item } ) => item.title,
			render: ( { item } ) => {
				return (
					<HStack spacing={ 2 } style={ { justifyContent: 'flex-start' } }>
						<Text weight={ 500 }>{ item.title }</Text>
						{ item.status && <Badge intent="default" children={ item.status } /> }
					</HStack>
				);
			},
		},
		{
			id: 'description',
			getValue: ( { item } ) => item.description,
		},
		{
			id: 'actions',
			getValue: ( { item } ) => item.actions,
			render: ( { item } ) => {
				if ( ! item.actions ) {
					return null;
				}
				const buttons = item.actions.map( ( action ) => {
					const buttonProps = {
						size: ( isSmallViewport ? 'default' : 'small' ) as ComponentProps<
							typeof Button
						>[ 'size' ],
						variant: ( isSmallViewport ? 'secondary' : 'tertiary' ) as ComponentProps<
							typeof Button
						>[ 'variant' ],
					};

					if ( action.id === 'download-badge' ) {
						return (
							<DownloadBadges key={ action.id } buttonProps={ { ...buttonProps, icon: null } } />
						);
					}
					if ( action.id === 'schedule-call' ) {
						return (
							<Button
								{ ...buttonProps }
								key={ action.id }
								onClick={ handleScheduleCall }
								isBusy={ isLoading }
								disabled={ isLoading }
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
								onClick={ () => handleActionClick( action.id ) }
							>
								{ action.label }
							</Button>
						);
					}
				} );
				if ( isSmallViewport ) {
					return (
						<VStack spacing={ 2 } style={ { paddingBlockStart: '8px', width: '100%' } }>
							{ buttons }
						</VStack>
					);
				}
				return (
					<HStack spacing={ 2 } style={ { paddingBlockStart: '8px' } }>
						{ buttons }
					</HStack>
				);
			},
		},
	];

	const view = {
		fields: [ 'description', 'actions' ],
		type: 'list' as const,
		titleField: 'title',
		mediaField: 'icon',
		showMedia: ! isSmallViewport,
	};

	return (
		<VStack spacing={ 6 } style={ { alignItems: 'center' } } alignment="stretch">
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
						className={ clsx( 'agency-tier-overview-revamped', {
							'is-small-viewport': isSmallViewport,
						} ) }
						style={ {
							width: isMediumViewport ? '100%' : '50%',
							minWidth: isMediumViewport ? 'unset' : '600px',
						} }
					>
						<CardHeader isBorderless>
							<SectionHeader title={ tierHeading } level={ 3 } />
						</CardHeader>
						<CardBody style={ { padding: '0', opacity: isHigherTier ? 0.5 : 1 } }>
							<DataViews< Benefit >
								data={ tier.benefits as Benefit[] }
								fields={ fields.map( ( field ) => {
									// Remove actions from higher tiers as they are not available yet
									if ( isHigherTier && field.id === 'actions' ) {
										return { ...field, render: () => null };
									}
									return field;
								} ) }
								view={ view }
								onChangeView={ () => {} }
								getItemId={ ( item ) => item.title }
								paginationInfo={ { totalItems: 1, totalPages: 1 } }
								defaultLayouts={ { list: {} } }
							>
								<DataViews.Layout />
							</DataViews>
						</CardBody>
					</Card>
				);
			} ) }
		</VStack>
	);
}
