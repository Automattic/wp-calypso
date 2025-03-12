import { external } from '@wordpress/icons';
import { useTranslate, numberFormatCompact, formatCurrency } from 'i18n-calypso';
import { useState, useCallback, useEffect, useMemo } from 'react';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import useProductAndPlans from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-product-and-plans';
import { PLAN_CATEGORY_STANDARD } from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/constants';
import getPressablePlan, {
	PressablePlan,
} from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan';
import PlanSelectionFilter from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/plan-selection/filter';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import HostingPlanSection from '../../common/hosting-plan-section';
import CustomPlanCardContent from './custom-plan-card-content';
import RegularPlanCardContent from './regular-plan-card-content';

import './style.scss';

type Props = {
	onSelect: ( plan: APIProductFamilyProduct, quantity: number ) => void;
	isReferralMode?: boolean;
	pressableOwnership?: 'agency' | 'regular' | 'none';
	existingPlan: APIProductFamilyProduct | null;
	existingPlanInfo: PressablePlan | null;
	isFetching?: boolean;
};

export default function PressablePlanSection( {
	onSelect,
	isReferralMode,
	pressableOwnership,
	existingPlan,
	existingPlanInfo,
	isFetching,
}: Props ) {
	const translate = useTranslate();

	const [ selectedPlan, setSelectedPlan ] = useState< APIProductFamilyProduct | null >( null );

	const dispatch = useDispatch();

	const { pressablePlans } = useProductAndPlans( {
		selectedSite: null,
		productSearchQuery: '',
	} );

	const selectedPlanInfo = selectedPlan ? getPressablePlan( selectedPlan.slug ) : null;

	useEffect( () => {
		if ( pressablePlans?.length ) {
			setSelectedPlan(
				isReferralMode
					? pressablePlans.find( ( plan ) => plan.slug === 'pressable-build' ) ?? null
					: pressablePlans[ 0 ]
			);
		}
	}, [ isReferralMode, pressablePlans, setSelectedPlan ] );

	useEffect( () => {
		if ( ! isReferralMode && existingPlan ) {
			setSelectedPlan( existingPlan );
		}
	}, [ existingPlan, isReferralMode ] );

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
					plans={ pressablePlans }
					onSelectPlan={ setSelectedPlan }
					pressablePlan={ isReferralMode ? null : existingPlanInfo }
					isLoading={ ! isFetching }
				/>
			</HostingPlanSection.Banner>
		);
	}, [
		pressableOwnership,
		selectedPlan,
		pressablePlans,
		isReferralMode,
		existingPlanInfo,
		isFetching,
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

	const isStandardPlan = selectedPlanInfo?.category === PLAN_CATEGORY_STANDARD;

	const onScheduleDemo = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_schedule_demo_click' )
		);
	}, [ dispatch ] );

	const PRESSABLE_CONTACT_LINK = 'https://pressable.com/request-demo';

	const isCustomPlan = ! selectedPlan;

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
						{ isStandardPlan
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
									count: numberFormatCompact( selectedPlanInfo?.visits ?? 0 ),
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
								visits: numberFormatCompact( 10000 ),
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
