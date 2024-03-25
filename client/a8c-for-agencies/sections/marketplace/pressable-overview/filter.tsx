import { useCallback, useMemo } from 'react';
import A4ASlider, { Option } from 'calypso/a8c-for-agencies/components/slider';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getPressablePlan from './lib/get-pressable-plan';
import getSliderOptions from './lib/get-slider-options';

type Props = {
	selectedPlan: APIProductFamilyProduct | null;
	plans: APIProductFamilyProduct[];
	onSelectPlan: ( plan: APIProductFamilyProduct | null ) => void;
};

export default function PressableOverviewFilter( { selectedPlan, plans, onSelectPlan }: Props ) {
	const options = useMemo(
		() =>
			getSliderOptions(
				'install',
				plans.map( ( plan ) => getPressablePlan( plan.slug ) )
			),
		[ plans ]
	);

	const onSelectOption = useCallback(
		( option: Option ) => {
			onSelectPlan( plans.find( ( plan ) => plan.slug === option.value ) ?? null );
		},
		[ onSelectPlan, plans ]
	);

	const selectedOption = options.findIndex( ( { value } ) => value === selectedPlan?.slug );

	return (
		<section className="pressable-overview__filter">
			<A4ASlider value={ selectedOption } onChange={ onSelectOption } options={ options } />
		</section>
	);
}
