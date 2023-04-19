import styled from '@emotion/styled';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ProvideExperimentData } from 'calypso/lib/explat';
import PlanTypeSelector, { PlanTypeSelectorProps } from './plan-type-selector';

const PlanSelectorLoadingEllipsis = styled( LoadingEllipsis )`
	margin: auto;
	display: block;
`;

const TermExperimentPlanTypeSelector: React.FunctionComponent< {
	isEligible: boolean;
	kind: 'interval' | 'customer';
	plans: string[];
	planTypeSelectorProps: PlanTypeSelectorProps;
} > = ( { isEligible, kind, plans, planTypeSelectorProps } ) => (
	<ProvideExperimentData name="calypso_plans_2yr_toggle" options={ { isEligible } }>
		{ ( isLoading, experimentData ) => {
			if ( isLoading ) {
				return <PlanSelectorLoadingEllipsis />;
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const variationName = experimentData?.variationName;

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
