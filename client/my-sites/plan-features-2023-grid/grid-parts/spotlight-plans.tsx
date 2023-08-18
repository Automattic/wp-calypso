import {
	getPlanClass,
	isFreePlan,
	isWpcomEnterpriseGridPlan,
	isWooExpressPlusPlan,
	PlanSlug,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ForwardedRef } from 'react';
import { PlanLogo } from '..';
import PlanFeatures2023GridActions from '../components/actions';
import PlanFeatures2023GridBillingTimeframe from '../components/billing-timeframe';
import PlanFeatures2023GridHeaderPrice from '../components/header-price';
import { GridPlan } from '../hooks/npm-ready/data-store/use-grid-plans';
import { PlanActionOverrides } from '../types';
import { Container } from './container';

interface Props {
	isLaunchPage?: boolean | null;
	flowName?: string | null;
	planActionOverrides?: PlanActionOverrides;
	gridPlanForSpotlight?: GridPlan;
	isInSignup?: boolean;
	isReskinned?: boolean;
	currentSitePlanSlug?: string | null;
	siteId?: number | null;
	isLargeCurrency?: boolean;
	canUserPurchasePlan: boolean | null;
	manageHref: string;
	selectedSiteSlug: string | null;
	isPlanUpgradeCreditEligible?: boolean;
	// temporary: element ref to scroll comparison grid into view once "Compare plans" button is clicked
	plansComparisonGridRef: ForwardedRef< HTMLDivElement >;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
}

export default function SpotlightPlans( props: Props ) {
	const translate = useTranslate();
	const {
		manageHref,
		canUserPurchasePlan,
		isLaunchPage,
		selectedSiteSlug,
		flowName,
		planActionOverrides,
		gridPlanForSpotlight,
		isInSignup,
		isReskinned,
		isLargeCurrency,
		isPlanUpgradeCreditEligible,
		currentSitePlanSlug,
		siteId,
		onUpgradeClick,
	} = props;
	if ( ! gridPlanForSpotlight ) {
		return null;
	}

	return (
		<div className="plan-features-2023-grid__plan-spotlight">
			<div
				className={ classNames(
					'plan-features-2023-grid__plan-spotlight-card',
					getPlanClass( gridPlanForSpotlight.planSlug )
				) }
			>
				<PlanLogo
					key={ gridPlanForSpotlight.planSlug }
					planIndex={ 0 }
					planSlug={ gridPlanForSpotlight.planSlug }
					renderedGridPlans={ [ gridPlanForSpotlight ] }
					isTableCell={ true }
					isInSignup={ isInSignup }
				/>
				{ /* PlanHeaders */ }
				<Container
					key={ gridPlanForSpotlight.planSlug }
					className="plan-features-2023-grid__table-item"
					isTableCell={ true }
				>
					<header
						className={ classNames(
							'plan-features-2023-grid__header',
							getPlanClass( gridPlanForSpotlight.planSlug )
						) }
					>
						<h4 className="plan-features-2023-grid__header-title">
							{ gridPlanForSpotlight.planConstantObj.getTitle() }
						</h4>
					</header>
				</Container>

				{ /* PlanTagline */ }
				<Container
					key={ gridPlanForSpotlight.planSlug }
					className="plan-features-2023-grid__table-item"
					isTableCell={ true }
				>
					<div className="plan-features-2023-grid__header-tagline">
						{ gridPlanForSpotlight.tagline }
					</div>
				</Container>
				{ /* PlanPrice */ }
				<Container
					scope="col"
					key={ gridPlanForSpotlight.planSlug }
					className={ classNames( 'plan-features-2023-grid__table-item', 'is-bottom-aligned', {
						'has-border-top': ! isReskinned,
					} ) }
					isTableCell={ true }
				>
					<PlanFeatures2023GridHeaderPrice
						planSlug={ gridPlanForSpotlight.planSlug }
						isPlanUpgradeCreditEligible={ !! isPlanUpgradeCreditEligible }
						isLargeCurrency={ !! isLargeCurrency }
						currentSitePlanSlug={ currentSitePlanSlug }
						siteId={ siteId }
					/>
					{ isWooExpressPlusPlan( gridPlanForSpotlight.planSlug ) && (
						<div className="plan-features-2023-grid__header-tagline">
							{ translate( 'Speak to our team for a custom quote.' ) }
						</div>
					) }
				</Container>
				{ /* BillingTimeframe */ }
				<Container
					className={ classNames(
						'plan-features-2023-grid__table-item',
						'plan-features-2023-grid__header-billing-info'
					) }
					isTableCell={ true }
					key={ gridPlanForSpotlight.planSlug }
				>
					<PlanFeatures2023GridBillingTimeframe
						planSlug={ gridPlanForSpotlight.planSlug }
						billingTimeframe={ gridPlanForSpotlight.planConstantObj.getBillingTimeFrame() }
					/>
				</Container>
				{ /* TopButtons */ }
				<Container
					key={ gridPlanForSpotlight.planSlug }
					className={ classNames(
						'plan-features-2023-grid__table-item',
						'is-top-buttons',
						'is-bottom-aligned'
					) }
					isTableCell={ false }
				>
					<PlanFeatures2023GridActions
						manageHref={ manageHref }
						canUserPurchasePlan={ canUserPurchasePlan }
						availableForPurchase={ gridPlanForSpotlight.availableForPurchase }
						className={ getPlanClass( gridPlanForSpotlight.planSlug ) }
						freePlan={ isFreePlan( gridPlanForSpotlight.planSlug ) }
						isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( gridPlanForSpotlight.planSlug ) }
						isWooExpressPlusPlan={ isWooExpressPlusPlan( gridPlanForSpotlight.planSlug ) }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						onUpgradeClick={ () => onUpgradeClick }
						planTitle={ gridPlanForSpotlight.planConstantObj.getTitle() }
						planSlug={ gridPlanForSpotlight.planSlug }
						flowName={ flowName }
						current={ gridPlanForSpotlight.current ?? false }
						currentSitePlanSlug={ currentSitePlanSlug }
						selectedSiteSlug={ selectedSiteSlug }
						planActionOverrides={ planActionOverrides }
						showMonthlyPrice={ true }
						siteId={ siteId }
						isStuck={ false }
						isLargeCurrency={ isLargeCurrency }
					/>
				</Container>
			</div>
		</div>
	);
}
