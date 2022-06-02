import { TYPE_FREE, TYPE_FLEXIBLE, TYPE_PRO } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import isLegacySiteWithHigherLimits from 'calypso/state/selectors/is-legacy-site-with-higher-limits';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { mid_breakpoint, mobile_breakpoint } from './breakpoints';
import { PlansComparisonAction } from './plans-comparison-action';
import { PlansComparisonCol } from './plans-comparison-col';
import { PlansComparisonColHeader } from './plans-comparison-col-header';
import { planComparisonFeatures } from './plans-comparison-features';
import { PlansDomainConnectionInfo } from './plans-domain-connection-info';
import usePlanPrices from './use-plan-prices';
import usePlans from './use-plans';
import type { WPComPlan } from '@automattic/calypso-products';
import type { RequestCartProduct as CartItem } from '@automattic/shopping-cart';

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

const ComparisonGrid = styled.div`
	display: grid;
	column-gap: 50px;
	grid-template-columns: 1fr 1fr;
	margin-top: 64px;
	margin-bottom: 64px;
	max-width: 862px;
	padding: 0 20px;

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

	@keyframes fade-in-rows {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	${ mid_breakpoint( `column-gap: 25px` ) }
	${ mobile_breakpoint( `grid-template-columns: 1fr;` ) }
`;

const PlansComparisonToggle = styled.div`
	grid-column: 1 / 3;

	button {
		background: rgba( 246, 247, 247, 0.5 );
		display: block;
		text-align: center;
		border-radius: 2px;
		padding: 15px;
		width: 100%;
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
	${ mobile_breakpoint( `
		display: none;
	` ) }
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
			<ComparisonGrid>
				{ plans.map( ( plan, index ) => (
					<PlansComparisonColHeader
						key={ plan.getProductId() }
						plan={ plan }
						currencyCode={ currencyCode }
						price={ prices[ index ].price }
						originalPrice={ prices[ index ].originalPrice }
						translate={ translate }
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
					</PlansComparisonColHeader>
				) ) }

				{ plans.map( ( plan ) => (
					<PlansComparisonCol
						plan={ plan }
						key={ plan.getProductId() }
						features={ planComparisonFeatures }
						showCollapsibleRows={ showCollapsibleRows }
						isLegacySiteWithHigherLimits={ legacySiteWithHigherLimits }
					>
						<PlansComparisonAction
							currentSitePlanSlug={ sitePlan?.product_slug }
							plan={ plan }
							className="plans-comparison__collapsible"
							isInSignup={ isInSignup }
							isPrimary={ plan.type === TYPE_PRO }
							isCurrentPlan={ sitePlan?.product_slug === plan.getStoreSlug() }
							manageHref={ manageHref }
							disabled={
								selectedDomainConnection && [ TYPE_FREE, TYPE_FLEXIBLE ].includes( plan.type )
							}
							onClick={ () => onSelectPlan( planToCartItem( plan ) ) }
						/>
					</PlansComparisonCol>
				) ) }
				<PlansComparisonToggle>
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
				</PlansComparisonToggle>
			</ComparisonGrid>
		</>
	);
};
