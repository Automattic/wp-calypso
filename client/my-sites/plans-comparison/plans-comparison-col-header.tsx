import styled from '@emotion/styled';
import PlanPrice from 'calypso/my-sites/plan-price';
import type { Plan } from '@automattic/calypso-products';

interface Props {
	currencyCode: string;
	plan: Plan;
	price?: number;
	originalPrice?: number;
	onClick?: ( productSlug: string ) => void;
}

const PlanTitle = styled.h2`
	font-size: 1.25rem;
`;

const PlanDescription = styled.p`
	color: var( --studio-gray-40 );
	font-size: 0.75rem;
	font-weight: 500;
`;

const PriceContainer = styled.div`
	display: flex;
	flex-direction: row;
`;

const BillingTimeFrame = styled.div`
	color: var( --studio-gray-40 );
	font-size: 0.75rem;
	font-weight: 500;
`;

export const PlansComparisonColHeader: React.FunctionComponent< Props > = ( {
	currencyCode,
	plan,
	// price,
	// originalPrice,
	children,
} ) => {
	return (
		<th scope="col">
			<PlanTitle>{ plan.getTitle() }</PlanTitle>
			<PlanDescription>{ plan.getDescription() }</PlanDescription>
			<PriceContainer>
				<PlanPrice currencyCode={ currencyCode } />
			</PriceContainer>
			<BillingTimeFrame>{ plan.getBillingTimeFrame() }</BillingTimeFrame>
			{ children }
		</th>
	);
};
