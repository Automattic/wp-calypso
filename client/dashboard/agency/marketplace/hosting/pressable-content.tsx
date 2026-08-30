import {
	Button,
	SelectControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Stat } from '../../../components/stat';
import pressableDescriptor from '../exclusive-offers/images/pressable-descriptor.svg';
import { CheckGrid } from './content-sections';
import {
	hostingBrands,
	pressablePlans,
	PRESSABLE_OVERAGES,
	formatUSD,
	formatCompactNumber,
} from './mock-data';
import OptionCards from './option-cards';
import type { PressablePlan } from './mock-data';

export type PressableUsage = {
	sites: number;
	visits: number;
	storageGB: number;
};

export const PRESSABLE_CUSTOM_SLUG = 'pressable-custom';

type PlanCategory = 'standard' | 'enterprise' | 'custom';

const PLAN_TYPE_OPTIONS: { value: PlanCategory; label: string; description: string }[] = [
	{
		value: 'standard',
		label: __( 'Standard' ),
		description: __(
			'Traffic and storage pooled across all your client sites, from 1 to 150 installs.'
		),
	},
	{
		value: 'enterprise',
		label: __( 'Enterprise' ),
		description: __( 'For large portfolios of 200 to 500 WordPress installs.' ),
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
	const installs = sprintf(
		/* translators: %d: number of WordPress installs */
		_n( '%d install', '%d installs', plan.install ),
		plan.install
	);
	return sprintf(
		/* translators: %1$s: plan name, %2$s: installs, %3$s: monthly visits, %4$d: storage in GB */
		__( '%1$s · %2$s · %3$s visits · %4$dGB' ),
		plan.name,
		installs,
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

	return (
		<VStack spacing={ 3 }>
			<Text variant="muted">
				{ __( 'Your traffic and storage limits are shared amongst your total sites.' ) }
			</Text>
			<CheckGrid
				columns={ 3 }
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

function CurrentPlanCard( { plan, usage }: { plan: PressablePlan; usage: PressableUsage } ) {
	const sitesPercent = Math.round( ( usage.sites / plan.install ) * 100 );
	const visitsPercent = Math.round( ( usage.visits / plan.visits ) * 100 );
	const storagePercent = Math.round( ( usage.storageGB / plan.storage ) * 100 );

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					level={ 3 }
					title={ sprintf(
						/* translators: %s: plan name */
						__( 'Your Pressable %s plan' ),
						plan.name
					) }
					actions={
						<Button variant="link" href="https://my.pressable.com" target="_blank" rel="noreferrer">
							{ __( 'Manage in Pressable ↗' ) }
						</Button>
					}
				/>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 } alignment="stretch">
					<Stat
						density="high"
						strapline={ __( 'Sites created' ) }
						metric={ String( usage.sites ) }
						description={ sprintf(
							/* translators: %d: maximum number of sites */
							__( 'of %d' ),
							plan.install
						) }
						progressValue={ sitesPercent }
						progressLabel={ `${ sitesPercent }%` }
					/>
					<Stat
						density="high"
						strapline={ __( 'Visits this month' ) }
						metric={ formatCompactNumber( usage.visits ) }
						description={ sprintf(
							/* translators: %s: maximum number of visits */
							__( 'of %s' ),
							formatCompactNumber( plan.visits )
						) }
						progressValue={ visitsPercent }
						progressLabel={ `${ visitsPercent }%` }
						progressColor={ visitsPercent > 80 ? 'alert-yellow' : undefined }
					/>
					<Stat
						density="high"
						strapline={ __( 'Storage used' ) }
						metric={ sprintf(
							/* translators: %d: storage used in GB */
							__( '%dGB' ),
							usage.storageGB
						) }
						description={ sprintf(
							/* translators: %d: maximum storage in GB */
							__( 'of %dGB' ),
							plan.storage
						) }
						progressValue={ storagePercent }
						progressLabel={ `${ storagePercent }%` }
						progressColor={ storagePercent > 80 ? 'alert-yellow' : undefined }
					/>
				</VStack>
			</CardBody>
		</Card>
	);
}

export default function PressableContent( {
	planSlug,
	onPlanChange,
	currentPlan,
	usage,
}: {
	planSlug: string;
	onPlanChange: ( slug: string ) => void;
	currentPlan?: PressablePlan;
	usage?: PressableUsage;
} ) {
	const [ category, setCategory ] = useState< PlanCategory >( 'standard' );

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
		<>
			{ currentPlan && usage && <CurrentPlanCard plan={ currentPlan } usage={ usage } /> }
			<Card>
				<CardHeader>
					<SectionHeader
						className="marketplace-hosting__card-header"
						level={ 3 }
						title={ currentPlan ? __( 'Upgrade your plan' ) : __( 'Configure Pressable' ) }
						description={
							hostingBrands.find( ( brand ) => brand.key === 'pressable' )?.description
						}
						decoration={
							<img src={ pressableDescriptor } alt="" className="marketplace-hosting__brand-mark" />
						}
					/>
				</CardHeader>
				<CardBody>
					<VStack spacing={ 5 }>
						<VStack spacing={ 4 }>
							<VStack spacing={ 3 }>
								<Heading level={ 3 } size={ 13 }>
									{ __( 'Choose a plan type' ) }
								</Heading>
								<OptionCards
									label={ __( 'Plan type' ) }
									options={ PLAN_TYPE_OPTIONS }
									selected={ category }
									onSelect={ ( value ) => handleCategoryChange( value as PlanCategory ) }
								/>
							</VStack>
							{ category !== 'custom' && (
								<VStack spacing={ 3 }>
									<Heading level={ 3 } size={ 13 }>
										{ __( 'Select your plan' ) }
									</Heading>
									<SelectControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={ __( 'Select your plan' ) }
										hideLabelFromVision
										value={ planSlug }
										options={ categoryPlans.map( ( p ) => ( {
											label:
												p.slug === currentPlan?.slug
													? sprintf(
															/* translators: %s: plan name and specs */
															__( '%s (current plan)' ),
															planOptionLabel( p )
													  )
													: planOptionLabel( p ),
											value: p.slug,
										} ) ) }
										onChange={ onPlanChange }
									/>
								</VStack>
							) }
						</VStack>

						<CardDivider />

						<PlanSpecs category={ category } plan={ plan } />
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}
