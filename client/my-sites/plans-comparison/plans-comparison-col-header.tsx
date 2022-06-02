import styled from '@emotion/styled';
import PlanPrice from 'calypso/my-sites/plan-price';
import { mobile_breakpoint } from './breakpoints';
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

const PlanComparisonHeader = styled.div`
	display: flex;
	flex-direction: column;
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
	padding: 30px;

	&.pro-plan {
		background: #f0f7fc;
		border: none;
	}
	&.starter-plan {
		border: solid 1px #e9e9ea;
		border-bottom: none;
		background: #fff;
	}

	${ mobile_breakpoint( `
		&.pro-plan {
			grid-row: 1;
		}
		&.starter-plan {
			grid-row: 3;
    	}
	` ) }
`;

const PlanTitle = styled.h2`
	margin-bottom: 10px;
	font-weight: 500;
	font-size: 2rem;
	font-family: Recoleta;
	line-height: 1.1;
`;

const PlanDescription = styled.p`
	font-size: 16px;
	font-weight: 400;
	margin: 0 0 1rem;
	flex: 1;
	line-height: 1.4;
`;

const PriceContainer = styled.div`
	display: flex;
	flex-direction: row;
	font-family: Recoleta;
	font-weight: 400;

	.plan-price {
		font-size: 2.75rem;
		line-height: 1;

		sup {
			font-size: 50%;
			vertical-align: super;
		}

		${ mobile_breakpoint( `
			font-size: 2.5rem;
		` ) }
	}
`;

const BillingTimeFrame = styled.div`
	color: var( --studio-gray-40 );
	font-size: 0.75rem;
	margin: 0.5rem 0 1rem;

	${ mobile_breakpoint( `
		font-size: 0.625rem;
		margin-bottom: 0.8rem;
	` ) }
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
		<PlanComparisonHeader className={ plan.getStoreSlug() }>
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
		</PlanComparisonHeader>
	);
};
