import styled from '@emotion/styled';
import PlanPrice from 'calypso/my-sites/plan-price';
import type { Plan } from '@automattic/calypso-products';
import type { translate } from 'i18n-calypso';

interface Props {
	currencyCode: string;
	plan: Plan;
	price?: number;
	originalPrice?: number;
	onClick?: ( productSlug: string ) => void;
	translate: typeof translate;
}

const PlanTitle = styled.h2`
	font-size: 1.25rem;
`;

const PlanDescription = styled.p`
	color: var( --studio-gray-50 );
	font-size: 0.875rem;
	font-weight: 500;
	margin: 0 0 1rem;
`;

const PriceContainer = styled.div`
	display: flex;
	flex-direction: row;
`;

const BillingTimeFrame = styled.div`
	color: var( --studio-gray-40 );
	font-size: 0.75rem;
	font-weight: 500;
	margin: 0.5rem 0;
`;

export const PlansComparisonColHeader: React.FunctionComponent< Props > = ( {
	currencyCode,
	plan,
	price,
	originalPrice,
	children,
	translate,
} ) => {
	const isDiscounted = typeof originalPrice === 'number';

	return (
		<th scope="col">
			<PlanTitle>{ plan.getTitle() }</PlanTitle>
			<PlanDescription>{ plan.getDescription() }</PlanDescription>
			<PriceContainer>
				{ isDiscounted && (
					<>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ originalPrice }
							displayFlatPrice={ true }
							translate={ translate }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							displayFlatPrice={ true }
							rawPrice={ price }
							translate={ translate }
							discounted
						/>
					</>
				) }
				{ ! isDiscounted && (
					<PlanPrice
						currencyCode={ currencyCode }
						displayFlatPrice={ true }
						rawPrice={ price }
						translate={ translate }
					/>
				) }
			</PriceContainer>
			<BillingTimeFrame>{ plan.getBillingTimeFrame() }</BillingTimeFrame>
			{ children }
		</th>
	);
};
