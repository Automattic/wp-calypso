import styled from '@emotion/styled';
import PlanPrice from 'calypso/my-sites/plan-price';
import type { Plan } from '@automattic/calypso-products';

interface Props {
	currencyCode: string;
	plan: Plan;
	price?: number;
	originalPrice?: number;
	onClick?: ( productSlug: string ) => void;
	children?: React.ReactNode;
}

const PriceContainer = styled.div`
	display: flex;
	flex-direction: row;
	font-family: Recoleta;
	font-weight: 500;

	.plan-price {
		font-size: 2.75rem;
		line-height: 1;
	}
`;

const BillingTimeFrame = styled.div`
	color: var( --studio-gray-40 );
	font-size: 0.75rem;
	font-weight: 500;
	margin: 0.5rem 0 1rem;
`;

export const PlansComparisonColCTA: React.FunctionComponent< Props > = ( {
	currencyCode,
	plan,
	price,
	originalPrice,
	children,
} ) => {
	const isDiscounted = typeof originalPrice === 'number';

	return (
		<th scope="col">
			<PriceContainer>
				{ isDiscounted && (
					<>
						<PlanPrice
							currencyCode={ currencyCode }
							rawPrice={ originalPrice }
							displayFlatPrice={ true }
							original
						/>
						<PlanPrice
							currencyCode={ currencyCode }
							displayFlatPrice={ true }
							rawPrice={ price }
							discounted
						/>
					</>
				) }
				{ ! isDiscounted && (
					<PlanPrice currencyCode={ currencyCode } displayFlatPrice={ true } rawPrice={ price } />
				) }
			</PriceContainer>
			<BillingTimeFrame>{ plan.getBillingTimeFrame() }</BillingTimeFrame>
			{ children }
		</th>
	);
};
