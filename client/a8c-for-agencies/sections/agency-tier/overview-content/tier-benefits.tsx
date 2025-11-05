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
import { SectionHeader } from 'calypso/dashboard/components/section-header';
import { ALL_TIERS } from './constants';
import type { AgencyTierType, Benefit } from './types';
import type { Field } from '@wordpress/dataviews';

import './style.scss';

export default function TierBenefits( {
	currentAgencyTierId,
}: {
	currentAgencyTierId?: AgencyTierType;
} ) {
	const currentTier = ALL_TIERS.find( ( tier ) => tier.id === currentAgencyTierId );

	const isSmallViewport = useViewportMatch( 'large', '<' );
	const isMediumViewport = useViewportMatch( 'huge', '<' );

	if ( ! currentTier ) {
		return null;
	}

	// Rearrange tiers: lower tiers first (except emerging-partner), then current tier, then higher tiers
	const lowerTiers = ALL_TIERS.filter( ( tier ) => tier.level < currentTier.level ).sort(
		( a, b ) => b.level - a.level
	);
	const higherTiers = ALL_TIERS.filter( ( tier ) => tier.level > currentTier.level ).sort(
		( a, b ) => b.level - a.level
	);

	// Combine all tiers in the desired order
	const allTiersToShow = [ currentTier, ...lowerTiers, ...higherTiers ];

	const fields: Field< Benefit >[] = [
		{
			id: 'icon',
			render: ( { item } ) =>
				item.icon ? (
					<Icon icon={ item.icon } size={ 32 } className="agency-tier-overview-revamped__icon" />
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
				const buttons = item.actions.map( ( action ) => (
					<Button
						size={ isSmallViewport ? 'default' : 'small' }
						variant={ isSmallViewport ? 'secondary' : 'tertiary' }
						key={ action.label }
						href={ action.href }
					>
						{ action.label }
					</Button>
				) );
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
								fields={ fields }
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
