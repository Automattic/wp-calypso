import { TYPE_FREE, TYPE_FLEXIBLE, TYPE_PRO, TYPE_STARTER } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useExperiment } from 'calypso/lib/explat';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import isLegacySiteWithHigherLimits from 'calypso/state/selectors/is-legacy-site-with-higher-limits';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { SCREEN_BREAKPOINT_SIGNUP, SCREEN_BREAKPOINT_PLANS } from './constant';
import isStarterPlanEnabled from './is-starter-plan-enabled';
import { PlansComparisonAction } from './plans-comparison-action';
import { PlansComparisonColHeader } from './plans-comparison-col-header';
import { planComparisonFeatures } from './plans-comparison-features';
import { PlansComparisonRow, DesktopContent, MobileContent } from './plans-comparison-row';
import { PlansDomainConnectionInfo } from './plans-domain-connection-info';
import usePlanPrices from './use-plan-prices';
import usePlans from './use-plans';
import type { WPComPlan } from '@automattic/calypso-products';
import type { RequestCartProduct as CartItem } from '@automattic/shopping-cart';

interface TableProps {
	firstColWidth: number;
	planCount: number;
	hideFreePlan?: boolean;
}

const getRowMobileLayout = ( breakpoint: number, pageClass: string ) => `
	@media screen and ( max-width: ${ breakpoint }px ) {
		${ pageClass } & {
			th.is-first,
			td.is-first {
				display: none;
			}

			${ DesktopContent } {
				display: none;
			}

			${ MobileContent } {
				display: block;
			}

			th,
			td {
				width: ${ ( { planCount }: { planCount: number } ) => `${ 100 / planCount }%` };
				height: unset;
			}
		}
	}
`;

export const globalOverrides = css`
	.is-section-plans {
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

		.sidebar .sidebar__heading::after,
		.sidebar .sidebar__menu-link::after {
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
					margin: 0;
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

		.notice.is-info,
		.notice.is-success {
			color: inherit;
			background: #f6f7f7;

			.notice__content.notice__content {
				html[dir='ltr'] & {
					padding: 10px 10px 10px 0;
				}
				html[dir='rtl'] & {
					padding: 10px 0 10px 10px;
				}
			}

			.notice__icon-wrapper.notice__icon-wrapper {
				background: none;
				width: 40px;
			}

			.gridicons-info-outline {
				fill: #008a20;
			}
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
	max-width: ${ ( { hideFreePlan } ) => ( hideFreePlan ? 728 : 980 ) }px;

	.is-section-plans & {
		html[dir='ltr'] & {
			margin-left: auto;
		}
		html[dir='rtl'] & {
			margin-right: auto;
		}
	}

	.is-section-signup & {
		margin-left: auto;
		margin-right: auto;
	}

	th,
	td {
		background: #fdfdfd;
		border-bottom: 1px solid rgba( 220, 220, 222, 0.2 );
		padding: 1.25rem;
		height: 4.5rem;
		box-sizing: border-box;
		width: ${ ( { firstColWidth, planCount } ) => `${ ( 100 - firstColWidth ) / planCount }%` };
		font-size: 0.875rem;
		vertical-align: middle;

		@media screen and ( max-width: ${ SCREEN_BREAKPOINT_SIGNUP }px ) {
			.is-section-signup & {
				width: 50%;
			}
		}

		@media screen and ( max-width: ${ SCREEN_BREAKPOINT_PLANS }px ) {
			.is-section-plans & {
				width: 50%;
			}
		}
	}

	tbody th,
	tbody td {
		padding: 0.78rem 1.25rem;
		height: 4rem;
	}

	tbody th {
		html[dir='ltr'] & {
			padding-left: 0;
		}
		html[dir='rtl'] & {
			padding-right: 0;
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

	th:last-child,
	td:last-child {
		background: #f0f7fc;
	}

	th.is-first,
	td.is-first {
		width: ${ ( { firstColWidth, hideFreePlan } ) => ( hideFreePlan ? 50 : firstColWidth ) }%;
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

	${ ( { hideFreePlan } ) =>
		! hideFreePlan && getRowMobileLayout( SCREEN_BREAKPOINT_SIGNUP, '.is-section-signup' ) }
	${ ( { hideFreePlan } ) =>
		! hideFreePlan && getRowMobileLayout( SCREEN_BREAKPOINT_PLANS, '.is-section-plans' ) }

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
	top: ${ ( { isInSignup } ) => ( isInSignup ? '0' : `var( --masterbar-height )` ) };
`;

const PlansComparisonRows = styled.tbody`
	tr:last-child {
		th,
		td {
			border-bottom: none;
		}
	}
`;

const PlansComparisonCollapsibleRows = styled( PlansComparisonRows )< {
	collapsed: boolean;
} >`
	display: ${ ( props ) => ( props.collapsed ? 'table-row-group' : 'none' ) };
	border-top: 1px solid rgba( 220, 220, 222, 0.2 );
	animation: fade-in-rows 0.3s ease;
`;

const PlansComparisonToggle = styled.tbody`
	tr {
		th,
		td,
		td:last-child {
			padding: 0;
			border-bottom: none;
			background: none;
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
			margin: 0;
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
	}
`;

const PlansHighlightFeatures = styled.div`
	font-size: 1rem;
	font-weight: 400;
	margin: 1.5rem 0 1rem;

	.gridicon.gridicon {
		width: 1.1em;
		height: 1.1em;

		html[dir='ltr'] & {
			margin: 0 5px -2px 0;
		}
		html[dir='rtl'] & {
			margin: 0 0 -2px 5px;
		}
	}

	.gridicons-checkmark {
		fill: var( --studio-green-50 );
	}
`;

const ComparisonHeader = styled( PlansComparisonRows )`
	td {
		font-size: 1rem;
		font-weight: 500;
	}
`;
interface Props {
	isInSignup?: boolean;
	selectedSiteId?: number;
	selectedSiteSlug?: string;
	selectedDomainConnection?: boolean;
	hideFreePlan?: boolean;
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
	selectedDomainConnection,
	purchaseId,
	hideFreePlan,
	onSelectPlan,
} ) => {
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'pricing_packaging_plans_page_copy_test'
	);
	const legacySiteWithHigherLimits = useSelector( ( state ) =>
		isLegacySiteWithHigherLimits( state, selectedSiteId || 0 )
	);
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSiteId || null ) );
	const [ showCollapsibleRows, setShowCollapsibleRows ] = useState( false );
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) ?? '';
	/*
	 * @todo clk Use of `hideFreePlan` will cause breakage if we are not showing the free plan at all.
	 * Potentially remove `hideFreePlan` logic alltogether when plans are finalised.
	 */
	const plans = usePlans( hideFreePlan );
	const prices = usePlanPrices( plans );
	const translate = useTranslate();
	const isMobile = useBreakpoint( '769' );

	const toggleCollapsibleRows = useCallback( () => {
		setShowCollapsibleRows( ! showCollapsibleRows );
	}, [ showCollapsibleRows ] );

	const manageHref =
		selectedSiteSlug && purchaseId
			? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
			: `/plans/${ selectedSiteSlug || '' }`;

	return (
		<>
			<Global styles={ globalOverrides } />
			<ComparisonTable
				firstColWidth={ 31 }
				planCount={ plans.length }
				hideFreePlan={ hideFreePlan && ! isStarterPlanEnabled() }
			>
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
								isExperiment={ 'treatment' === experimentAssignment?.variationName }
							>
								{ selectedDomainConnection && <PlansDomainConnectionInfo plan={ plan } /> }
								<PlansComparisonAction
									currentSitePlanSlug={ sitePlan?.product_slug }
									plan={ plan }
									isInSignup={ isInSignup }
									isPrimary={ plan.type === TYPE_PRO }
									isCurrentPlan={ sitePlan?.product_slug === plan.getStoreSlug() }
									manageHref={ manageHref }
									disabled={
										selectedDomainConnection && [ TYPE_FREE, TYPE_FLEXIBLE ].includes( plan.type )
									}
									onClick={ () => onSelectPlan( planToCartItem( plan ) ) }
								/>
								{ plan.type === TYPE_STARTER &&
								'treatment' === experimentAssignment?.variationName ? (
									<PlansHighlightFeatures>
										<p>
											<b>Our favorite Starter features:</b>
										</p>
										<div>
											<Gridicon icon="checkmark" />
											Custom website address.
										</div>
										<div>
											<Gridicon icon="checkmark" />
											Professional site templates.
										</div>
										<div>
											<Gridicon icon="checkmark" />
											Customer support forums.
										</div>
										<div>
											<Gridicon icon="checkmark" />
											Automatic WordPress updates.
										</div>
										<div>
											<Gridicon icon="checkmark" />
											Flexible upgrade options.
										</div>
									</PlansHighlightFeatures>
								) : null }

								{ plan.type === TYPE_PRO && 'treatment' === experimentAssignment?.variationName ? (
									<PlansHighlightFeatures>
										<p>
											<b>Our favorite Pro features:</b>
										</p>
										<div>
											<Gridicon icon="checkmark" />
											Unlimited traffic at blazing speeds.
										</div>
										<div>
											<Gridicon icon="checkmark" />
											Support for Plugins and Themes.
										</div>
										<div>
											<Gridicon icon="checkmark" />
											Real-time live chat support.
										</div>
										<div>
											<Gridicon icon="checkmark" />
											Unmatched managed hosting service.
										</div>
										<div>
											<Gridicon icon="checkmark" />
											SFTP and database access for devs.
										</div>
									</PlansHighlightFeatures>
								) : null }
							</PlansComparisonColHeader>
						) ) }
					</tr>
				</THead>
				{ /* { 'treatment' === experimentAssignment?.variationName && (
					<ComparisonHeader>
						<tr>
							<td colSpan={ isMobile ? 1 : 2 }>Detailed plan comparison:</td>
							<td>&nbsp;</td>
						</tr>
					</ComparisonHeader>
				) } */ }
				<PlansComparisonRows>
					{ planComparisonFeatures.slice( 0, 8 ).map( ( feature ) => (
						<PlansComparisonRow
							feature={ feature }
							plans={ plans }
							isLegacySiteWithHigherLimits={ legacySiteWithHigherLimits }
							key={ feature.features[ 0 ] }
						/>
					) ) }
				</PlansComparisonRows>
				<PlansComparisonCollapsibleRows collapsed={ showCollapsibleRows }>
					{ planComparisonFeatures.slice( 8 ).map( ( feature ) => (
						<PlansComparisonRow
							feature={ feature }
							plans={ plans }
							isLegacySiteWithHigherLimits={ legacySiteWithHigherLimits }
							key={ feature.features[ 0 ] }
						/>
					) ) }
				</PlansComparisonCollapsibleRows>
				<PlansComparisonToggle>
					<tr>
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
					</tr>
				</PlansComparisonToggle>
			</ComparisonTable>
		</>
	);
};
