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
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { SCREEN_BREAKPOINT_SIGNUP, SCREEN_BREAKPOINT_PLANS } from './constant';
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

const getMobileLayout = ( breakpoint: number, pageClass: string ) => `
	@media screen and ( max-width: ${ breakpoint }px ) {
		${ pageClass } & {
			th.is-first,
			td.is-first {
				display: none;
			}

			th,
			td {
				width: ${ ( { planCount }: { planCount: number } ) => `${ 100 / planCount }%` };
			}
		}
	}
`;
const ComparisonTable = styled.table< TableProps >`
	border-collapse: collapse;

	.is-section-plans & {
		max-width: 950px;
		margin-left: auto;
	}

	th,
	td {
		background: #fdfdfd;
		border-bottom: 1px solid rgba( 220, 220, 222, 0.2 );
		padding: 1rem;
		min-height: 2rem;
		width: ${ ( { firstColWidth, planCount } ) => `${ ( 100 - firstColWidth ) / planCount }%` };
		font-size: 1rem;
		vertical-align: middle;

		@media screen and ( max-width: ${ SCREEN_BREAKPOINT_SIGNUP }px ) {
			.is-section-signup & {
				font-size: 0.75rem;
			}
		}

		@media screen and ( max-width: ${ SCREEN_BREAKPOINT_PLANS }px ) {
			.is-section-plans & {
				font-size: 0.75rem;
			}
		}
	}

	thead th,
	thead td {
		vertical-align: top;
	}

	th:nth-of-type( even ),
	td:nth-of-type( even ) {
		background: #f0f7fc;
	}

	th.is-first,
	td.is-first {
		width: ${ ( { firstColWidth } ) => `${ firstColWidth }%` };
	}

	tr:last-child td:last-child {
		box-shadow: 0 30px #f0f7fc;
	}

	th .button {
		width: 100%;
		border-radius: 4px;
		font-weight: 500;
	}

	th:last-child .button {
		background: #0675c4;
		border-color: #0675c4;
	}

	th:last-child .button .button:hover {
		background: #055d9c;
		border-color: #055d9c;
	}

	${ getMobileLayout( SCREEN_BREAKPOINT_SIGNUP, '.is-section-signup' ) }
	${ getMobileLayout( SCREEN_BREAKPOINT_PLANS, '.is-section-plans' ) }
`;

const THead = styled.thead< { isInSignup: boolean } >`
	position: sticky;
	top: ${ ( { isInSignup } ) => ( isInSignup ? '0' : `var( --masterbar-height )` ) };
`;

const MobileComparePlansHeader = styled.td`
	display: none;

	h3 {
		font-size: 1.5rem;
		font-family: Recoleta;
		line-height: 2;
		margin-top: 0.5rem;
	}

	p {
		font-size: 0.875rem;
	}

	@media screen and ( max-width: ${ SCREEN_BREAKPOINT_SIGNUP }px ) {
		.is-section-signup & {
			display: table-cell;
		}
	}

	@media screen and ( max-width: ${ SCREEN_BREAKPOINT_PLANS }px ) {
		.is-section-plans & {
			display: table-cell;
		}
	}
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
				<tr>
					<MobileComparePlansHeader colSpan={ 3 }>
						<h3>{ translate( 'Compare plans' ) }</h3>
						<p>{ 'Lorem ipsum dolor sit amet, consectetur dolor sit amet adipiscing elit.' }</p>
					</MobileComparePlansHeader>
				</tr>
				{ planComparisonFeatures.map( ( feature ) => (
					<PlansComparisonRow feature={ feature } plans={ plans } key={ feature.features[ 0 ] } />
				) ) }
			</tbody>
		</ComparisonTable>
	);
};
