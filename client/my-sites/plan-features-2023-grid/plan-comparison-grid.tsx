import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { PlanProperties } from './types';
const PlanComparisonHeader = styled.h1`
	font-size: 2rem;
	text-align: center;
	margin: 48px 0;
`;

type PlanComparison2023GridProps = { planProperties?: Array< PlanProperties > };

export const PlanComparison2023Grid: React.FC< PlanComparison2023GridProps > = () => {
	const translate = useTranslate();
	return (
		<div className="plan-comparison-grid">
			<PlanComparisonHeader className="wp-brand-font">
				{ translate( 'Compare our plans and find yours' ) }
			</PlanComparisonHeader>
		</div>
	);
};
