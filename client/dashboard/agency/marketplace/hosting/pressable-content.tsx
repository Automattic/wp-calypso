import {
	RadioControl,
	SelectControl,
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

const PLAN_TYPE_OPTIONS: { value: PlanCategory; label: string; description: string }[] = [
	{
		value: 'signature',
		label: __( 'Signature' ),
		description: __( 'Traffic and storage pooled across all your client sites.' ),
	},
	{
		value: 'signature-high',
		label: __( 'Signature High' ),
		description: __( 'For large portfolios — 200 to 500 WordPress installs.' ),
	},
	{
		value: 'premium',
		label: __( 'Premium' ),
		description: __(
			'For mission critical sites that demand extra attention and resources. From US$350 per month.'
		),
	},
	{
		value: 'custom',
		label: __( 'Custom' ),
		description: __(
			'More than 500 installs or 10M visits per month? We’ll size a plan to your portfolio.'
		),
	},
];

function planOptionLabel( plan: PressablePlan ) {
	if ( plan.category === 'premium' ) {
		return sprintf(
			/* translators: %1$s: plan name, %2$s: monthly visits, %3$d: storage in GB, %4$d: PHP workers */
			__( '%1$s — %2$s visits · %3$dGB · %4$d workers' ),
			plan.name,
			formatCompactNumber( plan.visits ),
			plan.storage,
			plan.worker
		);
	}
	return sprintf(
		/* translators: %1$s: plan name, %2$d: WordPress installs, %3$s: monthly visits, %4$d: storage in GB */
		__( '%1$s — %2$d installs · %3$s visits · %4$dGB' ),
		plan.name,
		plan.install,
		formatCompactNumber( plan.visits ),
		plan.storage
	);
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

	const categoryPlans = pressablePlans.filter( ( p ) => p.category === category );
	const plan = pressablePlans.find( ( p ) => p.slug === planSlug );

	const handleCategoryChange = ( next: PlanCategory ) => {
		setCategory( next );
		if ( next === 'custom' ) {
			onPlanChange( PRESSABLE_CUSTOM_SLUG );
			return;
		}
		const first = pressablePlans.find( ( p ) => p.category === next );
		if ( first ) {
			onPlanChange( first.slug );
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
					<VStack spacing={ 4 }>
						<RadioControl
							label={ __( 'Choose a plan type' ) }
							selected={ category }
							options={ PLAN_TYPE_OPTIONS }
							onChange={ ( value ) => handleCategoryChange( value as PlanCategory ) }
						/>
						{ category !== 'custom' && (
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Plan' ) }
								value={ planSlug }
								options={ categoryPlans.map( ( p ) => ( {
									label: planOptionLabel( p ),
									value: p.slug,
								} ) ) }
								onChange={ onPlanChange }
							/>
						) }
					</VStack>

					<CardDivider />

					<PlanSpecs category={ category } plan={ plan } />
				</VStack>
			</CardBody>
		</Card>
	);
}
