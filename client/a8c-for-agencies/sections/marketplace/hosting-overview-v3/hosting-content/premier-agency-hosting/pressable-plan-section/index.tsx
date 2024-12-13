import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useEffect, useMemo } from 'react';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import useProductAndPlans from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-product-and-plans';
import useExistingPressablePlan from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/hooks/use-existing-pressable-plan';
import getPressablePlan from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/lib/get-pressable-plan';
import PlanSelectionFilter from 'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/plan-selection/filter';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import HostingPlanSection from '../../common/hosting-plan-section';
import CustomPressablePlanCardContent from './custom-pressable-plan-card-content';
import PressablePlanSelectorCardContent from './pressable-plan-selector-card-content';

import './style.scss';
type Props = {
	onSelect: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export default function PressablePlanSection( { onSelect }: Props ) {
	const translate = useTranslate();

	const [ selectedPlan, setSelectedPlan ] = useState< APIProductFamilyProduct | null >( null );

	const dispatch = useDispatch();

	const { pressablePlans } = useProductAndPlans( {
		selectedSite: null,
		productSearchQuery: '',
	} );

	const planInfo = selectedPlan?.slug ? getPressablePlan( selectedPlan?.slug ) : null;

	const {
		existingPlan,
		pressablePlan,
		isReady: isExistingPlanFetched,
	} = useExistingPressablePlan( {
		plans: pressablePlans,
	} );

	useEffect( () => {
		if ( pressablePlans?.length ) {
			setSelectedPlan( pressablePlans[ 0 ] );
		}
	}, [ pressablePlans, setSelectedPlan ] );

	useEffect( () => {
		if ( existingPlan ) {
			setSelectedPlan( existingPlan );
		}
	}, [ existingPlan ] );

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
		return (
			<HostingPlanSection.Banner>
				<PlanSelectionFilter
					selectedPlan={ selectedPlan }
					plans={ pressablePlans }
					onSelectPlan={ setSelectedPlan }
					pressablePlan={ pressablePlan }
					isLoading={ ! isExistingPlanFetched }
				/>
			</HostingPlanSection.Banner>
		);
	}, [ isExistingPlanFetched, pressablePlan, pressablePlans, selectedPlan ] );

	if ( ! selectedPlan ) {
		return (
			<HostingPlanSection className="pressable-plan-section">
				{ banner }

				<HostingPlanSection.Card>
					<CustomPressablePlanCardContent />
				</HostingPlanSection.Card>

				<HostingPlanSection.Details heading={ translate( 'High Resource Sites' ) }>
					<p>
						{ translate(
							'Single site plan add-ons designed to offer completely custom traffic and storage limits for your high profile clients that need more resources than the rest of your portfolio.'
						) }
					</p>

					<div className="pressable-plan-section__details-two-lists">
						<SimpleList
							items={ [
								translate( '{{b}}1 WordPress install{{/b}}', {
									components: {
										b: <b />,
									},
								} ),
								translate( '{{b}}1 staging site{{/b}}', {
									components: {
										b: <b />,
									},
								} ),
								translate( '{{b}}Custom visits{{/b}} per month', {
									components: {
										b: <b />,
									},
								} ),
							] }
						/>

						<SimpleList
							items={ [
								translate( '{{b}}Custom storage{{/b}} per month', {
									components: {
										b: <b />,
									},
								} ),
								translate( '{{b}}Unmetered bandwidth{{/b}}', {
									components: {
										b: <b />,
									},
								} ),

								translate( '{{b}}Custom{{/b}} PHP & CPU usage', {
									components: {
										b: <b />,
									},
								} ),
							] }
						/>
					</div>

					<span className="pressable-plan-section__details-footnote">
						{ translate(
							`*If you exceed your plan's storage or traffic limits, you will be charged $0.50 per GB and $8 per 10K visits per month.`
						) }
					</span>
				</HostingPlanSection.Details>
			</HostingPlanSection>
		);
	}

	return (
		<HostingPlanSection className="pressable-plan-section">
			{ banner }
			<HostingPlanSection.Card>
				<PressablePlanSelectorCardContent plan={ selectedPlan } onSelect={ onPlanAddToCart } />
			</HostingPlanSection.Card>

			<HostingPlanSection.Details heading={ selectedPlan.name }>
				<p>
					{ translate(
						'With Shared Resource Plans, your traffic & storage limits are shared amongst your total sites.'
					) }
				</p>

				<SimpleList
					items={ [
						translate(
							'Up to {{b}}%(count)d WordPress install{{/b}}',
							'Up to {{b}}%(count)d WordPress installs{{/b}}',
							{
								args: {
									count: planInfo?.install ?? 0,
								},
								count: planInfo?.install ?? 0,
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
									count: planInfo?.install ?? 0,
								},
								count: planInfo?.install ?? 0,
								components: {
									b: <b />,
								},
								comment: '%(count)d is the number of staging sites.',
							}
						),
						translate( '{{b}}%(count)s visits{{/b}} per month*', {
							args: {
								count: formatNumber( planInfo?.visits ?? 0 ),
							},
							components: {
								b: <b />,
							},
							comment: '%(count)d is the number of visits.',
						} ),
						translate( '{{b}}%(storageSize)dGB of storage*{{/b}}', {
							args: {
								storageSize: planInfo?.storage ?? 0,
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

				<span className="pressable-plan-section__details-footnote">
					{ translate(
						`*If you exceed your plan's storage or traffic limits, you will be charged $0.50 per GB and $8 per 10K visits per month.`
					) }
				</span>
			</HostingPlanSection.Details>

			<HostingPlanSection.Aside
				heading={ translate( 'Schedule a demo' ) }
				cta={ {
					label: translate( 'Schedule a demo' ),
					onClick: () => {},
					variant: 'secondary',
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
