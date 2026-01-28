import { formatCurrency, formatNumberCompact } from '@automattic/number-formatters';
import { external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useEffect, useMemo } from 'react';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import useProductAndPlans from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-product-and-plans';
import {
	PLAN_CATEGORY_SIGNATURE,
	PLAN_CATEGORY_SIGNATURE_HIGH,
	PLAN_CATEGORY_STANDARD,
	PLAN_CATEGORY_PREMIUM,
	PLAN_CATEGORY_ENTERPRISE,
} from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/constants';
import getPressablePlan, {
	PressablePlan,
} from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan';
import PlanSelectionFilter from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/plan-selection/filter';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import HostingPlanSection from '../../common/hosting-plan-section';
import CustomPlanCardContent from './custom-plan-card-content';
import PremiumPlanSection from './premium-plan-section';
import RegularPlanCardContent from './regular-plan-card-content';
import type { TermPricingType } from 'calypso/a8c-for-agencies/sections/marketplace/types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

import './style.scss';

type Props = {
	onSelect: ( plan: APIProductFamilyProduct, quantity: number ) => void;
	isReferralMode?: boolean;
	pressableOwnership?: 'agency' | 'regular' | 'none';
	existingPlan: APIProductFamilyProduct | null;
	existingPlanInfo: PressablePlan | null;
	isFetching?: boolean;
	termPricing: TermPricingType;
};

const getSelectedTab = (
	existingPressablePlan: PressablePlan | null,
	areSignaturePlans: boolean
) => {
	if ( ! existingPressablePlan ) {
		return areSignaturePlans ? PLAN_CATEGORY_SIGNATURE : PLAN_CATEGORY_STANDARD;
	}

	// If there is an existing plan, map its category to the appropriate tab
	let tabCategory = existingPressablePlan.category;
	if ( areSignaturePlans ) {
		if ( existingPressablePlan.category === PLAN_CATEGORY_STANDARD ) {
			tabCategory = PLAN_CATEGORY_SIGNATURE;
		} else if ( existingPressablePlan.category === PLAN_CATEGORY_ENTERPRISE ) {
			tabCategory = PLAN_CATEGORY_SIGNATURE_HIGH;
		}
	} else if ( existingPressablePlan.category === PLAN_CATEGORY_SIGNATURE ) {
		// If not using signature plans, map signature categories back to standard/enterprise
		tabCategory = PLAN_CATEGORY_STANDARD;
	} else if ( existingPressablePlan.category === PLAN_CATEGORY_SIGNATURE_HIGH ) {
		tabCategory = PLAN_CATEGORY_ENTERPRISE;
	}

	return tabCategory;
};

export default function PressablePlanSection( {
	onSelect,
	isReferralMode,
	pressableOwnership,
	existingPlan,
	existingPlanInfo,
	isFetching,
	termPricing,
}: Props ) {
	const translate = useTranslate();

	const areSignaturePlans = useMemo( () => {
		return (
			isReferralMode ||
			! existingPlanInfo ||
			existingPlanInfo?.category === PLAN_CATEGORY_SIGNATURE ||
			existingPlanInfo?.category === PLAN_CATEGORY_SIGNATURE_HIGH
		);
	}, [ existingPlanInfo, isReferralMode ] );

	const existingPressablePlan = isReferralMode ? null : existingPlanInfo;

	const [ selectedTab, setSelectedTab ] = useState(
		getSelectedTab( existingPressablePlan, areSignaturePlans )
	);
	const [ selectedPlan, setSelectedPlan ] = useState< APIProductFamilyProduct | null >( null );

	const dispatch = useDispatch();

	const { pressablePlans } = useProductAndPlans( {
		selectedSite: null,
		productSearchQuery: '',
	} );

	const selectedPlanInfo = selectedPlan ? getPressablePlan( selectedPlan.slug ) : null;

	const filteredPressablePlans = useMemo( () => {
		if ( ! pressablePlans ) {
			return [];
		}

		if ( areSignaturePlans ) {
			return pressablePlans.filter( ( plan ) => plan.slug.startsWith( 'pressable-signature-' ) );
		}

		return pressablePlans.filter( ( plan ) => ! plan.slug.startsWith( 'pressable-signature-' ) );
	}, [ pressablePlans, areSignaturePlans ] );

	useEffect( () => {
		if ( pressablePlans?.length ) {
			const defaultSlug = areSignaturePlans ? 'pressable-signature-1' : 'pressable-build';
			setSelectedPlan(
				isReferralMode
					? pressablePlans.find( ( plan ) => plan.slug === defaultSlug ) ?? null
					: pressablePlans.find( ( plan ) => plan.slug === defaultSlug ) ?? pressablePlans[ 0 ]
			);
		}
	}, [ isReferralMode, pressablePlans, setSelectedPlan, areSignaturePlans ] );

	useEffect( () => {
		if ( ! isReferralMode && existingPlan ) {
			setSelectedPlan( existingPlan );
		}
	}, [ existingPlan, isReferralMode ] );

	useEffect( () => {
		setSelectedTab( getSelectedTab( existingPressablePlan, areSignaturePlans ) );
	}, [ areSignaturePlans, existingPressablePlan, setSelectedTab ] );

	const onPlanAddToCart = useCallback( () => {
		if ( selectedPlan ) {
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_select_plan_click', {
					slug: selectedPlan?.slug,
				} )
			);
			onSelect( selectedPlan, 1 );
		}
	}, [ dispatch, onSelect, selectedPlan ] );

	const banner = useMemo( () => {
		if ( pressableOwnership === 'regular' ) {
			return null;
		}

		return (
			<HostingPlanSection.Banner>
				<PlanSelectionFilter
					selectedPlan={ selectedPlan }
					plans={ filteredPressablePlans }
					onSelectPlan={ setSelectedPlan }
					pressablePlan={ existingPressablePlan }
					isLoading={ ! isFetching }
					areSignaturePlans={ areSignaturePlans }
					selectedTab={ selectedTab }
					setSelectedTab={ setSelectedTab }
				/>
			</HostingPlanSection.Banner>
		);
	}, [
		pressableOwnership,
		selectedPlan,
		filteredPressablePlans,
		existingPressablePlan,
		isFetching,
		areSignaturePlans,
		selectedTab,
	] );

	const heading = useMemo( () => {
		if ( isReferralMode ) {
			return translate( 'Refer a variety of plans to your clients' );
		}

		if ( existingPlan && pressableOwnership !== 'regular' ) {
			return translate( 'Upgrade your plan' );
		}

		return translate( 'Choose from a variety of high performance hosting plans' );
	}, [ existingPlan, isReferralMode, pressableOwnership, translate ] );

	const isStandardPlan =
		! areSignaturePlans && selectedPlanInfo?.category === PLAN_CATEGORY_STANDARD;

	const onScheduleDemo = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_schedule_demo_click' )
		);
	}, [ dispatch ] );

	const PRESSABLE_CONTACT_LINK = 'https://pressable.com/request-demo';

	const isCustomPlan = ! selectedPlan;

	// Show premium plan section if the selected tab is premium
	if ( selectedTab === PLAN_CATEGORY_PREMIUM ) {
		return <PremiumPlanSection heading={ heading } banner={ banner } />;
	}

	return (
		<HostingPlanSection className="pressable-plan-section" heading={ heading }>
			{ banner }
			<HostingPlanSection.Card>
				{ isCustomPlan ? (
					<CustomPlanCardContent isReferralMode={ isReferralMode } />
				) : (
					<RegularPlanCardContent
						plan={ selectedPlan }
						onSelect={ onPlanAddToCart }
						isReferralMode={ isReferralMode }
						pressableOwnership={ pressableOwnership }
						termPricing={ termPricing }
					/>
				) }
			</HostingPlanSection.Card>
			<HostingPlanSection.Details
				heading={
					isCustomPlan ? translate( 'Custom' ) : selectedPlan.name.replace( /Pressable/g, '' )
				}
			>
				{ isReferralMode ? (
					<p>
						{ translate(
							"When you refer a Pressable plan to your client, they'll pay and manage the billing. You'll manage the site, and make a recurring commission."
						) }
					</p>
				) : (
					<p>
						{ areSignaturePlans || isStandardPlan
							? translate(
									'With Signature Plans, your traffic & storage limits are shared amongst your total sites.'
							  )
							: translate(
									'With Enterprise Plans, your traffic & storage limits are shared amongst your total sites.'
							  ) }
					</p>
				) }

				{ isCustomPlan ? (
					<SimpleList
						items={ [
							translate( 'Custom WordPress installs' ),
							translate( '{{b}}%(count)s{{/b}} visits per month*', {
								args: {
									count: translate( 'Custom' ),
								},
								components: { b: <b /> },
								comment: '%(count)s is the number of visits per month.',
							} ),
							translate( '{{b}}%(size)s{{/b}} storage per month*', {
								args: {
									size: translate( 'Custom' ),
								},
								components: { b: <b /> },
								comment: '%(size)s is the amount of storage in gigabytes.',
							} ),
							translate( '{{b}}Unmetered{{/b}} bandwidth', {
								components: { b: <b /> },
							} ),
						] }
					/>
				) : (
					<SimpleList
						items={ [
							translate(
								'Up to {{b}}%(count)d WordPress install{{/b}}',
								'Up to {{b}}%(count)d WordPress installs{{/b}}',
								{
									args: {
										count: selectedPlanInfo?.install ?? 0,
									},
									count: selectedPlanInfo?.install ?? 0,
									components: {
										b: <b />,
									},
									comment: '%(count)d is the number of WordPress installs.',
								}
							),
							translate(
								'Up to {{b}}%(count)d staging site{{/b}}',
								'Up to {{b}}%(count)d staging sites{{/b}}',
								{
									args: {
										count: selectedPlanInfo?.install ?? 0,
									},
									count: selectedPlanInfo?.install ?? 0,
									components: {
										b: <b />,
									},
									comment: '%(count)d is the number of staging sites.',
								}
							),
							translate( '{{b}}%(count)s visits{{/b}} per month*', {
								args: {
									count: formatNumberCompact( selectedPlanInfo?.visits ?? 0 ),
								},
								components: {
									b: <b />,
								},
								comment: '%(count)d is the number of visits.',
							} ),
							translate( '{{b}}%(storageSize)dGB of storage*{{/b}}', {
								args: {
									storageSize: selectedPlanInfo?.storage ?? 0,
								},
								components: {
									b: <b />,
								},
								comment: '%(storageSize)d is the size of storage in GB.',
							} ),
							translate( '{{b}}Unmetered bandwidth{{/b}}', {
								components: {
									b: <b />,
								},
							} ),
						] }
					/>
				) }

				<span className="pressable-plan-section__details-footnote">
					{ translate(
						"*If you exceed your plan's storage or traffic limits, you will be charged %(storageCharge)s per GB and %(trafficCharge)s per %(visits)s visits per month.",
						{
							args: {
								storageCharge: formatCurrency( 0.5, 'USD', {
									stripZeros: true,
								} ),
								trafficCharge: formatCurrency( 8, 'USD', {
									stripZeros: true,
								} ),
								visits: formatNumberCompact( 10000 ),
							},
						}
					) }
				</span>
			</HostingPlanSection.Details>
			<HostingPlanSection.Aside
				heading={ translate( 'Schedule a demo' ) }
				cta={ {
					label: translate( 'Schedule a demo' ),
					onClick: onScheduleDemo,
					href: PRESSABLE_CONTACT_LINK,
					target: '_blank',
					variant: 'secondary',
					icon: external,
				} }
			>
				<p>
					{ translate(
						'Our experts are happy to give you a one-on-one tour of our platform to discuss:'
					) }
				</p>

				<SimpleList
					items={ [
						translate( 'Our support, service, and pricing flexibility' ),
						translate( 'The best hosting plan for your needs' ),
						translate( 'How to launch and manage WordPress sites' ),
						translate( 'The free perks that come with Pressable' ),
					] }
				/>
			</HostingPlanSection.Aside>
		</HostingPlanSection>
	);
}
