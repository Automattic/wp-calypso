import {
	getPlan,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_PRO,
	TYPE_FREE,
	TYPE_FLEXIBLE,
	TYPE_PRO,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
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

const getRowMobileLayout = ( breakpoint: number, pageClass: string ) => `
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

export const globalOverrides = css`
	#content.layout__content {
		overflow: unset;
		min-height: 100vh !important;
		background: #fdfdfd;
		padding-left: 0;
		padding-right: 0;
		padding-top: 47px;
	}

	.layout__secondary {
		box-shadow: 0 1px 0 1px rgba( 0, 0, 0, 0.1 );
	}

	.is-nav-unification .sidebar .sidebar__heading::after,
	.is-nav-unification .sidebar .sidebar__menu-link::after {
		html[dir='ltr'] & {
			margin-right: -1px;
			border-right-color: #fdfdfd;
		}
		html[dir='rtl'] & {
			margin-left: -1px;
			border-left-color: #fdfdfd;
		}
	}

	.main.is-wide-layout.is-wide-layout {
		max-width: 100%;
	}

	.formatted-header__title.formatted-header__title {
		font-size: 1rem;
		font-family: inherit !important;
		font-weight: 600;
		margin: 0 auto;
		max-width: 1040px;

		.gridicon {
			margin-bottom: -2px;
			fill: rgba( 140, 143, 148, 1 );
		}
	}

	.formatted-header__subtitle {
		display: none;
	}

	.formatted-header.formatted-header {
		border-bottom: 1px solid #dcdcde;
		padding-bottom: 24px;
		margin: 0;

		html[dir='ltr'] & {
			padding: 12px 24px 24px calc( var( --sidebar-width-min ) + 24px + 1px );
		}
		html[dir='rtl'] & {
			padding: 12px calc( var( --sidebar-width-min ) + 24px + 1px ) 24px 24px;
		}

		@media ( max-width: 782px ) {
			html[dir='ltr'] &,
			html[dir='rtl'] & {
				padding: 24px 16px;
			}
		}
	}

	.plans,
	.current-plan__content {
		max-width: 1040px;
		margin: auto;

		html[dir='ltr'] & {
			padding: 0 24px 0 calc( var( --sidebar-width-min ) + 24px + 1px );
		}
		html[dir='rtl'] & {
			padding: 0 calc( var( --sidebar-width-min ) + 24px + 1px ) 0 24px;
		}

		@media ( max-width: 782px ) {
			html[dir='ltr'] &,
			html[dir='rtl'] & {
				padding: 0;
			}
		}
	}

	.section-nav.section-nav {
		box-shadow: none;
		background: none;
		margin: 16px 0 32px;
	}

	.section-nav-tab {
		opacity: 0.7;
	}

	.section-nav-tab.is-selected,
	.section-nav-tab:hover {
		opacity: 1;
	}

	.section-nav-tab__link {
		font-size: 16px;
	}

	.section-nav-tab__link,
	.section-nav-tab__link:hover,
	.section-nav-tab__link:focus,
	.section-nav-tab__link:active {
		color: inherit !important;
		background: none !important;
	}

	.section-nav-tab:hover:not( .is-selected ) {
		border-bottom-color: transparent;
	}

	.my-plan-card__icon {
		display: none;
	}

	.my-plan-card__title {
		font-family: Recoleta;
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.notice.notice {
		color: inherit;
	}

	.notice.is-info {
		background: #f6f7f7;
	}

	.notice__content.notice__content {
		html[dir='ltr'] & {
			padding: 10px 10px 10px 0;
		}
		html[dir='rtl'] & {
			padding: 10px 0 10px 10px;
		}
	}

	.notice.is-info .notice__icon-wrapper.notice__icon-wrapper {
		background: none;
		width: 40px;
	}

	.notice .gridicons-info-outline {
		fill: #008a20;
	}

	.my-plan-card.my-plan-card.card {
		flex-direction: column;
		justify-content: stretch;
	}

	.my-plan-card__primary.my-plan-card__primary {
		min-width: 60%;
	}

	.my-plan-card__details.my-plan-card__details {
		display: none;
	}

	.popover__arrow {
		display: none;
	}
	.popover.info-popover__tooltip .popover__inner.popover__inner {
		background: var( --studio-gray-100 );
		color: #fff;
		border: none;
		padding: 8px 10px;
		border-radius: 4px;
		font-size: 0.75rem;
	}
`;

const ComparisonTable = styled.table< TableProps >`
	border-collapse: collapse;

	.is-section-plans & {
		max-width: 950px;
		html[dir='ltr'] & {
			margin-left: auto;
		}
		html[dir='rtl'] & {
			margin-right: auto;
		}
	}

	th,
	td {
		background: #fdfdfd;
		border-bottom: 1px solid rgba( 220, 220, 222, 0.2 );
		padding: 1.25rem;
		min-height: 2rem;
		width: ${ ( { firstColWidth, planCount } ) => `${ ( 100 - firstColWidth ) / planCount }%` };
		font-size: 0.875rem;
		vertical-align: middle;

		@media screen and ( max-width: ${ SCREEN_BREAKPOINT_SIGNUP }px ) {
			.is-section-signup & {
				width: 50%;
				font-size: 0.75rem;
			}
		}

		@media screen and ( max-width: ${ SCREEN_BREAKPOINT_PLANS }px ) {
			.is-section-plans & {
				width: 50%;
				font-size: 0.75rem;
			}
		}
	}

	thead th,
	thead td {
		vertical-align: top;
		border-bottom: none;
		@media screen and ( min-width: ${ SCREEN_BREAKPOINT_SIGNUP + 1 }px ) {
			.is-section-signup & {
				padding-bottom: 3.6rem;
			}
		}

		@media screen and ( min-width: ${ SCREEN_BREAKPOINT_PLANS + 1 }px ) {
			.is-section-plans & {
				padding-bottom: 3.6rem;
			}
		}
	}

	th:nth-of-type( even ),
	td:nth-of-type( even ) {
		background: #f0f7fc;
	}

	th.is-first,
	td.is-first {
		width: ${ ( { firstColWidth } ) => `${ firstColWidth }%` };
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

	.plans-comparison__rows tr:last-child {
		th,
		td {
			border-bottom: none;
		}
	}

	${ getRowMobileLayout( SCREEN_BREAKPOINT_SIGNUP, '.is-section-signup' ) }
	${ getRowMobileLayout( SCREEN_BREAKPOINT_PLANS, '.is-section-plans' ) }

	.plans-comparison__collapsible-rows {
		display: none;
		border-top: 1px solid rgba( 220, 220, 222, 0.2 );
	}

	.plans-comparison__collapsible-rows.is-active {
		display: table-row-group;
		animation: fade-in-rows 0.3s ease;
	}

	@keyframes fade-in-rows {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
`;

const THead = styled.thead< { isInSignup: boolean } >`
	position: sticky;
	top: ${ ( { isInSignup } ) => ( isInSignup ? '0' : `var( --masterbar-height )` ) };
`;

const PlanComparisonToggle = styled.tr`
	th,
	td {
		padding: 0;
		border-bottom: none;
	}

	${ getRowMobileLayout( SCREEN_BREAKPOINT_SIGNUP, '.is-section-signup' ) }
	${ getRowMobileLayout( SCREEN_BREAKPOINT_PLANS, '.is-section-plans' ) }

	button {
		background: rgba( 246, 247, 247, 0.5 );
		display: block;
		text-align: center;
		border-radius: 2px;
		padding: 15px;
		width: 100%;
		margin: 25px 0;
		cursor: pointer;

		.gridicon.gridicon {
			html[dir='ltr'] & {
				margin-right: 4px;
			}
			html[dir='rtl'] & {
				margin-left: 4px;
			}
		}
	}
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
	const [ showCollapsibleRows, setShowCollapsibleRows ] = useState( false );
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? '';
	const plans = [ getPlan( PLAN_WPCOM_FLEXIBLE ), getPlan( PLAN_WPCOM_PRO ) ] as WPComPlan[];
	const prices: PlanPrices[] = [ { price: 0 }, usePlanPrices( plans[ 1 ], selectedSiteId ) ];
	const translate = useTranslate();

	const toggleCollapsibleRows = useCallback( () => {
		setShowCollapsibleRows( ! showCollapsibleRows );
	}, [ showCollapsibleRows ] );

	const manageHref =
		selectedSiteSlug && purchaseId
			? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
			: `/plans/${ selectedSiteSlug || '' }`;
	const collapsibleRowsclassName = classNames(
		'plans-comparison__rows',
		'plans-comparison__collapsible-rows',
		{ 'is-active': showCollapsibleRows }
	);

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
								isPrimary={ plan.type === TYPE_PRO }
								isCurrentPlan={ sitePlan?.product_slug === plan.getStoreSlug() }
								manageHref={ manageHref }
								onClick={ () => onSelectPlan( planToCartItem( plan ) ) }
							/>
						</PlansComparisonColHeader>
					) ) }
				</tr>
			</THead>
			<tbody className="plans-comparison__rows">
				<tr>
					<MobileComparePlansHeader colSpan={ 2 }>
						<h3>{ translate( 'Compare plans' ) }</h3>
						<p>{ 'Lorem ipsum dolor sit amet, consectetur dolor sit amet adipiscing elit.' }</p>
					</MobileComparePlansHeader>
				</tr>
				{ planComparisonFeatures.slice( 0, 6 ).map( ( feature ) => (
					<PlansComparisonRow feature={ feature } plans={ plans } key={ feature.features[ 0 ] } />
				) ) }
			</tbody>
			<tbody className={ collapsibleRowsclassName }>
				{ planComparisonFeatures.slice( 6 ).map( ( feature ) => (
					<PlansComparisonRow feature={ feature } plans={ plans } key={ feature.features[ 0 ] } />
				) ) }
			</tbody>
			<tbody>
				<PlanComparisonToggle>
					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<th className="is-first"></th>
					<td colSpan={ 2 }>
						<button onClick={ toggleCollapsibleRows }>
							{ showCollapsibleRows ? (
								<>
									<Gridicon size={ 12 } icon="chevron-up" />
									{ translate( 'Hide full plan comparison' ) }
								</>
							) : (
								<>
									<Gridicon size={ 12 } icon="chevron-down" />
									{ translate( 'Show full plan comparison' ) }
								</>
							) }
						</button>
					</td>
				</PlanComparisonToggle>
			</tbody>
		</ComparisonTable>
	);
};
