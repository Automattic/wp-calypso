import {
	getPlan,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_MANAGED,
	TYPE_FREE,
	TYPE_FLEXIBLE,
	TYPE_MANAGED,
} from '@automattic/calypso-products';
import { Global } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
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
		font-size: 1rem;
		vertical-align: top;
	}

	th:nth-of-type( even ),
	td:nth-of-type( even ) {
		background: var( --studio-blue-0 );
	}

	th.is-first,
	td.is-first {
		width: ${ ( { firstColWidth } ) => `${ firstColWidth }%` };
	}

	.button {
		width: 100%;
		border-radius: 4px;
	}

	@media screen and ( max-width: ${ SCREEN_BREAKPOINT }px ) {
		th.is-first,
		td.is-first {
			display: none;
		}

		th,
		td {
			width: ${ ( { planCount } ) => `${ 100 / planCount }%` };
		}
	}
`;

const THead = styled.thead< { isInSignup: boolean } >`
	position: sticky;
	top: ${ ( { isInSignup } ) => ( isInSignup ? '0' : `var( --masterbar-height )` ) };
`;

interface Props {
	isInSignup?: boolean;
	selectedSiteId?: number;
	selectedSiteSlug?: string;
	purchaseId?: number | null;
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
	selectedSiteSlug,
	purchaseId,
	onSelectPlan,
} ) => {
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSiteId || null ) );
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? '';
	const plans = [ getPlan( PLAN_WPCOM_FLEXIBLE ), getPlan( PLAN_WPCOM_MANAGED ) ] as WPComPlan[];
	const prices: PlanPrices[] = [ { price: 0 }, usePlanPrices( plans[ 1 ], selectedSiteId ) ];
	const translate = useTranslate();

	const manageHref =
		selectedSiteSlug && purchaseId
			? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
			: `/plans/${ selectedSiteSlug || '' }`;

	return (
		<ComparisonTable firstColWidth={ 30 } planCount={ plans.length }>
			{ ! isInSignup && (
				<Global styles={ { '#content.layout__content': { overflow: 'unset' } } } />
			) }
			<THead isInSignup={ isInSignup }>
				<tr>
					<td className={ `is-first` }>
						<br />
					</td>
					{ plans.map( ( plan, index ) => (
						<PlansComparisonColHeader
							key={ plan.getProductId() }
							plan={ plan }
							currencyCode={ currencyCode }
							price={ prices[ index ].price }
							originalPrice={ prices[ index ].originalPrice }
							translate={ translate }
						>
							<PlansComparisonAction
								currentSitePlanSlug={ sitePlan?.product_slug }
								plan={ plan }
								isInSignup={ isInSignup }
								isPrimary={ plan.type === TYPE_MANAGED }
								isCurrentPlan={ sitePlan?.product_slug === plan.getStoreSlug() }
								manageHref={ manageHref }
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
