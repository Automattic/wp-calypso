import {
	SelectControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import pressableDescriptor from '../exclusive-offers/images/pressable-descriptor.svg';
import { CheckGrid } from './content-sections';
import {
	hostingBrands,
	pressableSignaturePlans,
	PRESSABLE_OVERAGES,
	formatUSD,
	formatCompactNumber,
} from './mock-data';

type SizingDimension = 'installs' | 'visits' | 'storage';

const SIZING_LABELS: Record< SizingDimension, string > = {
	installs: __( 'WordPress installs' ),
	visits: __( 'Traffic' ),
	storage: __( 'Storage' ),
};

function planSizingLabel(
	dimension: SizingDimension,
	plan: ( typeof pressableSignaturePlans )[ 0 ]
) {
	switch ( dimension ) {
		case 'installs':
			return sprintf(
				/* translators: %d: number of WordPress installs */
				_n( '%d install', '%d installs', plan.install ),
				plan.install
			);
		case 'visits':
			return sprintf(
				/* translators: %s: number of visits per month */
				__( '%s visits/mo' ),
				formatCompactNumber( plan.visits )
			);
		case 'storage':
			return sprintf(
				/* translators: %d: storage in GB */
				__( '%dGB storage' ),
				plan.storage
			);
	}
}

export default function PressableContent( {
	planSlug,
	onPlanChange,
}: {
	planSlug: string;
	onPlanChange: ( slug: string ) => void;
} ) {
	const [ sizingBy, setSizingBy ] = useState< SizingDimension >( 'installs' );

	const plan =
		pressableSignaturePlans.find( ( p ) => p.slug === planSlug ) ?? pressableSignaturePlans[ 0 ];

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					className="marketplace-hosting__card-header"
					level={ 3 }
					title={ __( 'Configure Pressable' ) }
					description={ hostingBrands.find( ( brand ) => brand.key === 'pressable' )?.description }
					decoration={
						<img src={ pressableDescriptor } alt="" className="marketplace-hosting__brand-mark" />
					}
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 5 }>
					<VStack spacing={ 3 }>
						<Heading level={ 3 } size={ 13 }>
							{ __( 'Size plans by total' ) }
						</Heading>
						<ToggleGroupControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							isBlock
							hideLabelFromVision
							label={ __( 'Size plans by' ) }
							value={ sizingBy }
							onChange={ ( value ) => setSizingBy( value as SizingDimension ) }
						>
							{ ( Object.keys( SIZING_LABELS ) as SizingDimension[] ).map( ( dimension ) => (
								<ToggleGroupControlOption
									key={ dimension }
									value={ dimension }
									label={ SIZING_LABELS[ dimension ] }
								/>
							) ) }
						</ToggleGroupControl>
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'Plan' ) }
							value={ planSlug }
							options={ pressableSignaturePlans.map( ( p ) => ( {
								label: `${ p.name } — ${ planSizingLabel( sizingBy, p ) }`,
								value: p.slug,
							} ) ) }
							onChange={ onPlanChange }
						/>
					</VStack>

					<CardDivider />

					<VStack spacing={ 3 }>
						<Heading level={ 3 } size={ 13 }>
							{ plan.name }
						</Heading>
						<Text variant="muted">
							{ __(
								'With Signature plans, your traffic & storage limits are shared amongst your total sites.'
							) }
						</Text>
						<CheckGrid
							items={ [
								sprintf(
									/* translators: %d: number of WordPress installs */
									_n( 'Up to %d WordPress install', 'Up to %d WordPress installs', plan.install ),
									plan.install
								),
								sprintf(
									/* translators: %d: number of staging sites */
									_n( 'Up to %d staging site', 'Up to %d staging sites', plan.install ),
									plan.install
								),
								sprintf(
									/* translators: %s: number of visits per month */
									__( '%s visits per month*' ),
									formatCompactNumber( plan.visits )
								),
								sprintf(
									/* translators: %d: storage in GB */
									__( '%dGB of storage*' ),
									plan.storage
								),
								sprintf(
									/* translators: %d: number of base PHP workers */
									__( '%d base PHP workers' ),
									plan.worker
								),
								__( 'Unmetered bandwidth' ),
							] }
						/>
						<Text variant="muted" size={ 12 }>
							{ sprintf(
								/* translators: %1$s: charge per GB, %2$s: charge per 10K visits */
								__(
									'*If you exceed your plan’s storage or traffic limits, you will be charged %1$s per GB and %2$s per 10K visits per month.'
								),
								formatUSD( PRESSABLE_OVERAGES.storagePerGB ),
								formatUSD( PRESSABLE_OVERAGES.trafficPer10kVisits )
							) }
						</Text>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
