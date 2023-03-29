import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ProvideExperimentData } from 'calypso/lib/explat';
import PlanTypeSelector, { PlanTypeSelectorProps } from './plan-type-selector';

const TermExperimentPlanTypeSelector: React.FunctionComponent< {
	isEligible: boolean;
	kind: string;
	plans: string[];
	planTypeSelectorProps: PlanTypeSelectorProps;
} > = ( { isEligible, kind, plans, planTypeSelectorProps } ) => (
	<ProvideExperimentData name="calypso_plans_2yr_toggle" options={ { isEligible } }>
		{ ( isLoading, experimentData ) => {
			if ( isLoading ) {
				return <LoadingEllipsis />;
			}

			const { variationName } = experimentData;

			const propsWithBiannualToggle = {
				...planTypeSelectorProps,
				showBiannualToggle:
					variationName === 'toggle_and_checkout' || variationName === 'toggle_only',
			};

			return <PlanTypeSelector { ...propsWithBiannualToggle } kind={ kind } plans={ plans } />;
		} }
	</ProvideExperimentData>
);

export default TermExperimentPlanTypeSelector;
