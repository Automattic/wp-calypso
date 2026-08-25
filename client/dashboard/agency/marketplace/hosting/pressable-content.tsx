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
	pressablePlans,
	PRESSABLE_OVERAGES,
	formatUSD,
	formatCompactNumber,
} from './mock-data';
import type { PressablePlan } from './mock-data';

export const PRESSABLE_CUSTOM_SLUG = 'pressable-custom';

type PlanCategory = 'signature' | 'signature-high' | 'premium' | 'custom';

const CATEGORY_LABELS: Record< PlanCategory, string > = {
	signature: __( 'Signature' ),
	'signature-high': __( 'Signature High' ),
	premium: __( 'Premium' ),
	custom: __( 'Custom' ),
};

type SizingDimension = 'installs' | 'visits' | 'storage';

const SIZING_LABELS: Record< SizingDimension, string > = {
	installs: __( 'WordPress installs' ),
	visits: __( 'Traffic' ),
	storage: __( 'Storage' ),
};

function planSizingLabel( dimension: SizingDimension, plan: PressablePlan ) {
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

function PlanSpecs( { category, plan }: { category: PlanCategory; plan?: PressablePlan } ) {
	if ( category === 'custom' ) {
		return (
			<VStack spacing={ 3 }>
				<Heading level={ 3 } size={ 13 }>
					{ __( 'Custom' ) }
				</Heading>
				<CheckGrid
					items={ [
						__( 'Custom WordPress installs' ),
						__( 'Custom visits per month' ),
						__( 'Custom storage per month' ),
						__( 'Unmetered bandwidth' ),
					] }
				/>
			</VStack>
		);
	}

	if ( ! plan ) {
		return null;
	}

	if ( category === 'premium' ) {
		return (
			<VStack spacing={ 3 }>
				<Heading level={ 3 } size={ 13 }>
					{ plan.name }
				</Heading>
				<Text variant="muted">
					{ __( 'For mission critical sites that demand extra attention and resources.' ) }
				</Text>
				<CheckGrid
					items={ [
						__( '1 WordPress install' ),
						sprintf(
							/* translators: %s: number of visits per month */
							__( '%s visits per month' ),
							formatCompactNumber( plan.visits )
						),
						sprintf(
							/* translators: %d: storage in GB */
							__( '%dGB of storage' ),
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
			</VStack>
		);
	}

	return (
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
	);
}

export default function PressableContent( {
	planSlug,
	onPlanChange,
}: {
	planSlug: string;
	onPlanChange: ( slug: string ) => void;
} ) {
	const [ category, setCategory ] = useState< PlanCategory >( 'signature' );
	const [ sizingBy, setSizingBy ] = useState< SizingDimension >( 'installs' );

	const categoryPlans = pressablePlans.filter( ( p ) => p.category === category );
	const plan = pressablePlans.find( ( p ) => p.slug === planSlug );

	const sizingDimensions: SizingDimension[] =
		category === 'premium' ? [ 'visits', 'storage' ] : [ 'installs', 'visits', 'storage' ];

	const handleCategoryChange = ( next: PlanCategory ) => {
		setCategory( next );
		if ( next === 'premium' && sizingBy === 'installs' ) {
			setSizingBy( 'visits' );
		}
		if ( next === 'custom' ) {
			onPlanChange( PRESSABLE_CUSTOM_SLUG );
		} else {
			const first = pressablePlans.find( ( p ) => p.category === next );
			if ( first ) {
				onPlanChange( first.slug );
			}
		}
	};

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
							{ __( 'Choose a plan type' ) }
						</Heading>
						<ToggleGroupControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							isBlock
							hideLabelFromVision
							label={ __( 'Plan type' ) }
							value={ category }
							onChange={ ( value ) => handleCategoryChange( value as PlanCategory ) }
						>
							{ ( Object.keys( CATEGORY_LABELS ) as PlanCategory[] ).map( ( key ) => (
								<ToggleGroupControlOption
									key={ key }
									value={ key }
									label={ CATEGORY_LABELS[ key ] }
								/>
							) ) }
						</ToggleGroupControl>
						{ category !== 'custom' && (
							<>
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
									{ sizingDimensions.map( ( dimension ) => (
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
									options={ categoryPlans.map( ( p ) => ( {
										label: `${ p.name } — ${ planSizingLabel( sizingBy, p ) }`,
										value: p.slug,
									} ) ) }
									onChange={ onPlanChange }
								/>
							</>
						) }
						{ category === 'custom' && (
							<Text variant="muted">
								{ __(
									'Need more than 500 WordPress installs or 10M visits per month? Our team will size a plan to your portfolio.'
								) }
							</Text>
						) }
					</VStack>

					<CardDivider />

					<PlanSpecs category={ category } plan={ plan } />
				</VStack>
			</CardBody>
		</Card>
	);
}
