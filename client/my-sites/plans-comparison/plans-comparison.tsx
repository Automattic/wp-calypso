import {
	getPlan,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_MANAGED,
	TYPE_FREE,
	TYPE_FLEXIBLE,
	TYPE_MANAGED,
} from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { SCREEN_BREAKPOINT } from './constant';
import { PlansComparisonAction } from './plans-comparison-action';
import { PlansComparisonColHeader } from './plans-comparison-col-header';
import { planComparisonFeatures } from './plans-comparison-features';
import { PlansComparisonRow } from './plans-comparison-row';
import { usePlanPrices, PlanPrices } from './use-plan-prices';
import type { WPComPlan } from '@automattic/calypso-products';
import type { RequestCartProduct as CartItem } from '@automattic/shopping-cart';
interface TableProps {
	firstColWidth: number;
	planCount: number;
}

const ComparisonTable = styled.table< TableProps >`
	max-width: 100%;
	border-collapse: collapse;
	margin: 0 auto;

	th,
	td {
		background: var( --studio-white );
		border-bottom: 1px solid var( --studio-gray-0 );
		padding: 1rem;
		min-height: 2rem;
		width: ${ ( { firstColWidth, planCount } ) => `${ ( 100 - firstColWidth ) / planCount }%` };
		vertical-align: middle;
		font-size: 1rem;
	}

	th:nth-child( odd ),
	td:nth-child( odd ) {
		background: var( --studio-blue-0 );
	}

	th:first-child,
	td:first-child {
		background: var( --studio-white );
		width: ${ ( { firstColWidth } ) => `${ firstColWidth }%` };
	}

	.button {
		width: 100%;
		border-radius: 4px;
	}

	@media screen and ( max-width: ${ SCREEN_BREAKPOINT }px ) {
		th:first-child,
		td:first-child {
			display: none;
		}

		th,
		td {
			width: ${ ( { planCount } ) => `${ 100 / planCount }%` };
		}
	}
`;

const THead = styled.thead`
	position: sticky;
	top: 0;
`;

interface Props {
	isInSignup?: boolean;
	selectedSiteId?: number;
	onSelectPlan: ( item: Partial< CartItem > | null ) => void;
}

function planToCartItem( plan: WPComPlan ): Partial< CartItem > | null {
	if ( plan.type === TYPE_FREE || plan.type === TYPE_FLEXIBLE ) {
		return null;
	}

	return {
		product_slug: plan.getStoreSlug(),
		product_id: plan.getProductId(),
	};
}

export const PlansComparison: React.FunctionComponent< Props > = ( {
	isInSignup = false,
	selectedSiteId,
	onSelectPlan,
} ) => {
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSiteId || null ) );
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? '';
	const plans = [ getPlan( PLAN_WPCOM_FLEXIBLE ), getPlan( PLAN_WPCOM_MANAGED ) ] as WPComPlan[];
	const prices: PlanPrices[] = [ { price: 0 }, usePlanPrices( plans[ 1 ], selectedSiteId ) ];
	// const maxPrice = Math.max( ...prices.map( ( { price } ) => price ) );
	const translate = useTranslate();

	return (
		<ComparisonTable firstColWidth={ 30 } planCount={ plans.length }>
			<THead>
				<tr>
					<th>
						<br />
					</th>
					{ plans.map( ( plan, index ) => (
						<PlansComparisonColHeader
							plan={ plan }
							currencyCode={ currencyCode }
							price={ prices[ index ].price }
							originalPrice={ prices[ index ].originalPrice }
							translate={ translate }
						>
							<PlansComparisonAction
								currentSitePlanSlug={ sitePlan?.product_slug }
								planName={ String( plan.getTitle() ) }
								planType={ plan.type }
								isInSignup={ isInSignup }
								isPrimary={ plan.type === TYPE_MANAGED }
								onClick={ () => onSelectPlan( planToCartItem( plan ) ) }
							/>
						</PlansComparisonColHeader>
					) ) }
				</tr>
			</THead>
			<tbody>
				{ planComparisonFeatures.map( ( feature ) => (
					<PlansComparisonRow feature={ feature } plans={ plans } key={ feature.features[ 0 ] } />
				) ) }
			</tbody>
		</ComparisonTable>
	);
};
