import { ProvideExperimentData } from 'calypso/lib/explat';
import PlanTypeSelector, { PlanTypeSelectorProps } from './plan-type-selector';

const TermExperimentPlanTypeSelector: React.FunctionComponent< {
	isEligible: boolean;
	selectorKind: string;
	plans: string[];
	planTypeSelectorProps: PlanTypeSelectorProps;
} > = ( { isEligible, selectorKind, plans, planTypeSelectorProps } ) => (
	<ProvideExperimentData name="calypso_plans_2yr_toggle" options={ { isEligible } }>
		{ ( isLoading, experimentData ) => {
			if ( isLoading ) {
				return <></>;
			}

			const { variationName } = experimentData;

			const propsWithBiannualToggle = {
				...planTypeSelectorProps,
				showBiannualToggle:
					variationName === 'toggle_and_checkout' || variationName === 'toggle_only',
			};

			return (
				<PlanTypeSelector { ...propsWithBiannualToggle } kind={ selectorKind } plans={ plans } />
			);
		} }
	</ProvideExperimentData>
);

export default TermExperimentPlanTypeSelector;
