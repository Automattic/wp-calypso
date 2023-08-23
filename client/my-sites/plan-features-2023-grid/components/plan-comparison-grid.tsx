import {
	getPlanClass,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	isWooExpressPlan,
	FEATURE_GROUP_ESSENTIAL_FEATURES,
	PLAN_WOOEXPRESS_PLUS,
	getPlanFeaturesGrouped,
	getWooExpressFeaturesGrouped,
	PLAN_ENTERPRISE_GRID_WPCOM,
	FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	getPlans,
} from '@automattic/calypso-products';
import { Gridicon, JetpackLogo } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { useIsPlanUpgradeCreditVisible } from 'calypso/my-sites/plan-features-2023-grid/hooks/use-is-plan-upgrade-credit-visible';
import getPlanFeaturesObject from 'calypso/my-sites/plan-features-2023-grid/lib/get-plan-features-object';
import PlanTypeSelector from 'calypso/my-sites/plans-features-main/components/plan-type-selector';
import { usePlansGridContext } from '../grid-context';
import useHighlightAdjacencyMatrix from '../hooks/npm-ready/use-highlight-adjacency-matrix';
import useIsLargeCurrency from '../hooks/npm-ready/use-is-large-currency';
import { sortPlans } from '../lib/sort-plan-properties';
import { plansBreakSmall } from '../media-queries';
import { getStorageStringFromFeature, usePricingBreakpoint } from '../util';
import PlanFeatures2023GridActions from './actions';
import PlanFeatures2023GridBillingTimeframe from './billing-timeframe';
import PlanFeatures2023GridHeaderPrice from './header-price';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import PopularBadge from './popular-badge';
import type {
	GridPlan,
	TransformedFeatureObject,
} from '../hooks/npm-ready/data-store/use-grid-plans';
import type { PlanActionOverrides } from '../types';
import type { FeatureObject, Feature, FeatureGroup, PlanSlug } from '@automattic/calypso-products';
import type { PlanTypeSelectorProps } from 'calypso/my-sites/plans-features-main/components/plan-type-selector';

function DropdownIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" fill="none" viewBox="0 -5 26 24">
			<path
				fill="#0675C4"
				fillRule="evenodd"
				d="M18 10.5L13 15l-5-4.5L9.224 9 13 12.399 16.776 9 18 10.5z"
				clipRule="evenodd"
			></path>
		</svg>
	);
}

const JetpackIconContainer = styled.div`
	padding-inline-start: 6px;
	display: inline-block;
	vertical-align: middle;
	line-height: 1;
`;

const PlanComparisonHeader = styled.h1`
	.plans .step-container .step-container__content &&,
	&& {
		font-size: 2rem;
		text-align: center;
		margin: 48px 0;
	}
`;

const Title = styled.div< { isHiddenInMobile?: boolean } >`
	font-weight: 500;
	font-size: 20px;
	padding: 14px;
	flex: 1;
	display: flex;
	align-items: center;
	column-gap: 5px;
	border: solid 1px #e0e0e0;
	border-left: none;
	border-right: none;

	.gridicon {
		transform: ${ ( props ) =>
			props.isHiddenInMobile ? 'rotateZ( 180deg )' : 'rotateZ( 0deg )' };
	}

	${ plansBreakSmall( css`
		padding-inline-start: 0;
		border: none;
		padding: 0;

		.gridicon {
			display: none;
		}
	` ) }
`;

const Grid = styled.div< { isInSignup?: boolean } >`
	display: grid;
	margin-top: ${ ( props ) => ( props.isInSignup ? '90px' : '64px' ) };
	background: #fff;
	border: solid 1px #e0e0e0;

	${ plansBreakSmall( css`
		border-radius: 5px;
	` ) }
`;

const Row = styled.div< {
	isHiddenInMobile?: boolean;
	className?: string;
	isHighlighted?: boolean;
} >`
	justify-content: space-between;
	margin-bottom: -1px;
	align-items: stretch;
	display: ${ ( props ) => ( props.isHiddenInMobile ? 'none' : 'flex' ) };

	${ plansBreakSmall( css`
		display: flex;
		margin: 0 20px;
		padding: 12px 0;
		border-bottom: 1px solid #eee;
	` ) }

	${ ( props ) =>
		props.isHighlighted &&
		css`
			${ plansBreakSmall( css`
				background-color: #fafafa;
				border-top: 1px solid #eee;
				font-weight: bold;
				margin: -1px 0 0;
				padding: 12px 20px;
				color: #3a434a;
			` ) }
		` };
`;

const PlanRow = styled( Row )`
	&:last-of-type {
		display: none;
	}

	${ plansBreakSmall( css`
		border-bottom: none;

		&:last-of-type {
			display: flex;
			padding-top: 0;
			padding-bottom: 0;
		}
	` ) }
`;

const TitleRow = styled( Row )`
	cursor: pointer;
	display: flex;

	${ plansBreakSmall( css`
		cursor: default;
		border-bottom: none;
		padding: 20px 0 10px;
		pointer-events: none;
	` ) }
`;

const Cell = styled.div< { textAlign?: 'start' | 'center' | 'end' } >`
	text-align: ${ ( props ) => props.textAlign ?? 'start' };
	display: flex;
	flex: 1;
	justify-content: flex-start;
	flex-direction: column;
	align-items: center;
	padding: 33px 20px 0;
	border-right: solid 1px #e0e0e0;

	.gridicon {
		fill: currentColor;
	}

	img {
		max-width: 100%;
	}

	&.title-is-subtitle {
		padding-top: 0;
	}

	&:last-of-type {
		border-right: none;
	}

	${ Row }:last-of-type & {
		padding-bottom: 24px;

		${ plansBreakSmall( css`
			padding-bottom: 0px;
		` ) }
	}

	${ plansBreakSmall( css`
		padding: 0 14px;
		border-right: none;
		justify-content: center;

		&:first-of-type {
			padding-inline-start: 0;
		}
		&:last-of-type {
			padding-inline-end: 0;
			border-right: none;
		}
	` ) }
`;

const RowTitleCell = styled.div`
	display: none;
	font-size: 14px;
	${ plansBreakSmall( css`
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 290px;
	` ) }
`;

const PlanSelector = styled.header`
	position: relative;

	.plan-comparison-grid__title {
		.gridicon {
			margin-inline-start: 6px;
		}
	}

	.plan-comparison-grid__title-select {
		appearance: none;
		-moz-appearance: none;
		-webkit-appearance: none;
		background: 0 0;
		border: none;
		font-size: inherit;
		color: inherit;
		font-family: inherit;
		opacity: 0;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		cursor: pointer;
		height: 30px;

		&:focus ~ .plan-comparison-grid__title {
			outline: thin dotted;
		}
	}
`;

const StorageButton = styled.div`
	background: #f2f2f2;
	border-radius: 5px;
	padding: 4px 0;
	width: -moz-fit-content;
	width: fit-content;
	text-align: center;
	font-size: 0.75rem;
	font-weight: 400;
	line-height: 20px;
	color: var( --studio-gray-90 );
	min-width: 64px;
	margin-top: 10px;

	${ plansBreakSmall( css`
		margin-top: 0;
	` ) }
`;

const FeatureFootnotes = styled.div`
	ol {
		margin: 2em 0 0 1em;
	}

	ol li {
		font-size: 11px;
		padding-left: 1em;
	}
`;

const FeatureFootnote = styled.span`
	position: relative;
	font-size: 50%;
	font-weight: 600;

	sup {
		position: absolute;
		top: -10px;
		left: 0;
	}
`;

type PlanComparisonGridProps = {
	intervalType?: string;
	planTypeSelectorProps: PlanTypeSelectorProps;
	isInSignup?: boolean;
	isLaunchPage?: boolean | null;
	flowName?: string | null;
	currentSitePlanSlug?: string | null;
	manageHref: string;
	canUserPurchasePlan?: boolean | null;
	selectedSiteSlug: string | null;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	siteId?: number | null;
	planActionOverrides?: PlanActionOverrides;
	selectedPlan?: string;
	selectedFeature?: string;
	isGlobalStylesOnPersonal?: boolean;
	showLegacyStorageFeature?: boolean;
};

type PlanComparisonGridHeaderProps = {
	displayedGridPlans: GridPlan[];
	visibleGridPlans: GridPlan[];
	isInSignup?: boolean;
	isLaunchPage?: boolean | null;
	isFooter?: boolean;
	flowName?: string | null;
	onPlanChange: ( currentPlan: PlanSlug, event: ChangeEvent< HTMLSelectElement > ) => void;
	currentSitePlanSlug?: string | null;
	manageHref: string;
	canUserPurchasePlan?: boolean | null;
	selectedSiteSlug: string | null;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	siteId?: number | null;
	planActionOverrides?: PlanActionOverrides;
	selectedPlan?: string;
};

type PlanComparisonGridHeaderCellProps = PlanComparisonGridHeaderProps & {
	allVisible: boolean;
	isLastInRow: boolean;
	isLargeCurrency: boolean;
	isPlanUpgradeCreditEligible: boolean;
	planSlug: PlanSlug;
};

type PlanFeatureFootnotes = {
	footnoteList: string[];
	footnotesByFeature: Record< Feature, number >;
};

const PlanComparisonGridHeaderCell = ( {
	planSlug,
	allVisible,
	isLastInRow,
	isFooter,
	isInSignup,
	visibleGridPlans,
	onPlanChange,
	displayedGridPlans,
	currentSitePlanSlug,
	manageHref,
	canUserPurchasePlan,
	isLaunchPage,
	flowName,
	selectedSiteSlug,
	isLargeCurrency,
	onUpgradeClick,
	planActionOverrides,
	isPlanUpgradeCreditEligible,
	siteId,
}: PlanComparisonGridHeaderCellProps ) => {
	const { gridPlansIndex } = usePlansGridContext();
	const gridPlan = gridPlansIndex[ planSlug ];
	const highlightAdjacencyMatrix = useHighlightAdjacencyMatrix( {
		renderedPlans: visibleGridPlans.map( ( { planSlug } ) => planSlug ),
	} );

	if ( ! gridPlan ) {
		return null;
	}

	const headerClasses = classNames( 'plan-comparison-grid__header-cell', getPlanClass( planSlug ), {
		'popular-plan-parent-class': gridPlan.highlightLabel,
		'is-last-in-row': isLastInRow,
		'plan-is-footer': isFooter,
		'is-left-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.leftOfHighlight,
		'is-right-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.rightOfHighlight,
		'is-only-highlight': highlightAdjacencyMatrix[ planSlug ]?.isOnlyHighlight,
		'is-current-plan': gridPlan.current,
	} );
	const popularBadgeClasses = classNames( {
		'is-current-plan': gridPlan.current,
	} );
	const showPlanSelect = ! allVisible && ! gridPlan.current;

	return (
		<Cell className={ headerClasses } textAlign="start">
			<PopularBadge
				isInSignup={ isInSignup }
				planSlug={ planSlug }
				additionalClassName={ popularBadgeClasses }
			/>
			<PlanSelector>
				{ showPlanSelect && (
					<select
						onChange={ ( event: ChangeEvent< HTMLSelectElement > ) =>
							onPlanChange( planSlug, event )
						}
						className="plan-comparison-grid__title-select"
						value={ planSlug }
					>
						{ displayedGridPlans.map( ( { planSlug: otherPlan, planTitle } ) => {
							const isVisiblePlan = visibleGridPlans.find(
								( { planSlug } ) => planSlug === otherPlan
							);

							if ( isVisiblePlan && otherPlan !== planSlug ) {
								return null;
							}

							return (
								<option key={ otherPlan } value={ otherPlan }>
									{ planTitle }
								</option>
							);
						} ) }
					</select>
				) }
				<h4 className="plan-comparison-grid__title">
					<span>{ gridPlan.planTitle }</span>
					{ showPlanSelect && <DropdownIcon /> }
				</h4>
			</PlanSelector>
			<PlanFeatures2023GridHeaderPrice
				planSlug={ planSlug }
				isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
				isLargeCurrency={ isLargeCurrency }
				currentSitePlanSlug={ currentSitePlanSlug }
				siteId={ siteId }
			/>
			<div className="plan-comparison-grid__billing-info">
				<PlanFeatures2023GridBillingTimeframe planSlug={ planSlug } />
			</div>
			<PlanFeatures2023GridActions
				currentSitePlanSlug={ currentSitePlanSlug }
				manageHref={ manageHref }
				canUserPurchasePlan={ canUserPurchasePlan }
				availableForPurchase={ gridPlan.availableForPurchase }
				className={ getPlanClass( planSlug ) }
				freePlan={ isFreePlan( planSlug ) }
				isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( planSlug ) }
				isInSignup={ isInSignup }
				isLaunchPage={ isLaunchPage }
				planSlug={ planSlug }
				flowName={ flowName }
				selectedSiteSlug={ selectedSiteSlug }
				onUpgradeClick={ () => onUpgradeClick( planSlug ) }
				planActionOverrides={ planActionOverrides }
				showMonthlyPrice={ false }
				isStuck={ false }
			/>
		</Cell>
	);
};

const PlanComparisonGridHeader = ( {
	displayedGridPlans,
	visibleGridPlans,
	isInSignup,
	isLaunchPage,
	flowName,
	isFooter,
	onPlanChange,
	currentSitePlanSlug,
	manageHref,
	canUserPurchasePlan,
	selectedSiteSlug,
	onUpgradeClick,
	siteId,
	planActionOverrides,
	selectedPlan,
}: PlanComparisonGridHeaderProps ) => {
	const allVisible = visibleGridPlans.length === displayedGridPlans.length;
	const isLargeCurrency = useIsLargeCurrency( { gridPlans: displayedGridPlans } );
	const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible(
		siteId ?? 0,
		displayedGridPlans.map( ( { planSlug } ) => planSlug )
	);
	return (
		<PlanRow>
			<RowTitleCell
				key="feature-name"
				className="plan-comparison-grid__header-cell plan-comparison-grid__interval-toggle is-placeholder-header-cell"
			/>
			{ visibleGridPlans.map( ( { planSlug }, index ) => (
				<PlanComparisonGridHeaderCell
					planSlug={ planSlug }
					isPlanUpgradeCreditEligible={ isPlanUpgradeCreditEligible }
					key={ planSlug }
					isLastInRow={ index === visibleGridPlans.length - 1 }
					isFooter={ isFooter }
					allVisible={ allVisible }
					isInSignup={ isInSignup }
					visibleGridPlans={ visibleGridPlans }
					onPlanChange={ onPlanChange }
					displayedGridPlans={ displayedGridPlans }
					currentSitePlanSlug={ currentSitePlanSlug }
					manageHref={ manageHref }
					canUserPurchasePlan={ canUserPurchasePlan }
					flowName={ flowName }
					selectedSiteSlug={ selectedSiteSlug }
					onUpgradeClick={ onUpgradeClick }
					isLaunchPage={ isLaunchPage }
					isLargeCurrency={ isLargeCurrency }
					planActionOverrides={ planActionOverrides }
					selectedPlan={ selectedPlan }
					siteId={ siteId }
				/>
			) ) }
		</PlanRow>
	);
};

const PlanComparisonGridFeatureGroupRowCell: React.FunctionComponent< {
	feature?: FeatureObject;
	allJetpackFeatures: Set< string >;
	visibleGridPlans: GridPlan[];
	planSlug: PlanSlug;
	isStorageFeature: boolean;
	flowName?: string | null;
	intervalType?: string;
} > = ( { feature, visibleGridPlans, planSlug, isStorageFeature, intervalType } ) => {
	const { gridPlansIndex } = usePlansGridContext();
	const gridPlan = gridPlansIndex[ planSlug ];
	const translate = useTranslate();
	const highlightAdjacencyMatrix = useHighlightAdjacencyMatrix( {
		renderedPlans: visibleGridPlans.map( ( { planSlug } ) => planSlug ),
	} );

	if ( ! gridPlan ) {
		return null;
	}

	const featureSlug = feature?.getSlug();

	const hasFeature =
		isStorageFeature ||
		( featureSlug
			? [ ...gridPlan.features.wpcomFeatures, ...gridPlan.features.jetpackFeatures ]
					.filter( ( feature ) =>
						'monthly' === intervalType ? ! feature.availableOnlyForAnnualPlans : true
					)
					.some( ( feature ) => feature.getSlug() === featureSlug )
			: false );

	const hasConditionalFeature = featureSlug
		? gridPlan.features.conditionalFeatures?.some(
				( feature ) => feature.getSlug() === featureSlug
		  )
		: false;
	const storageOption = gridPlan.features.storageOptions.find( ( option ) => ! option.isAddOn );
	const cellClasses = classNames(
		'plan-comparison-grid__feature-group-row-cell',
		'plan-comparison-grid__plan',
		getPlanClass( planSlug ),
		{
			'popular-plan-parent-class': gridPlan.highlightLabel,
			'has-feature': hasFeature,
			'has-conditional-feature': hasConditionalFeature,
			'title-is-subtitle': 'live-chat-support' === featureSlug,
			'is-left-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.leftOfHighlight,
			'is-right-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.rightOfHighlight,
			'is-only-highlight': highlightAdjacencyMatrix[ planSlug ]?.isOnlyHighlight,
		}
	);
	const planPaymentTransactionFees = gridPlan.features.wpcomFeatures?.find(
		( feature ) => feature?.getFeatureGroup?.() === FEATURE_GROUP_PAYMENT_TRANSACTION_FEES
	);

	return (
		<Cell className={ cellClasses } textAlign="center">
			{ isStorageFeature ? (
				<>
					<span className="plan-comparison-grid__plan-title">{ translate( 'Storage' ) }</span>
					<StorageButton className="plan-features-2023-grid__storage-button" key={ planSlug }>
						{ getStorageStringFromFeature( storageOption?.slug || '' ) }
					</StorageButton>
				</>
			) : (
				<>
					{ FEATURE_GROUP_PAYMENT_TRANSACTION_FEES === featureSlug ? (
						<>
							{ planPaymentTransactionFees ? (
								<span className="plan-comparison-grid__plan-conditional-title">
									{ planPaymentTransactionFees?.getAlternativeTitle?.() }
								</span>
							) : (
								<Gridicon icon="minus-small" color="#C3C4C7" />
							) }
						</>
					) : (
						<>
							{ feature?.getIcon && (
								<span className="plan-comparison-grid__plan-image">
									{ /** Note: this approach may not work if the icon is not a string or ReactElement. */ }
									{ feature.getIcon() as React.ReactNode }
								</span>
							) }
							<span className="plan-comparison-grid__plan-title">
								{ feature?.getAlternativeTitle?.() || feature?.getTitle() }
							</span>
							{ feature?.getCompareTitle && (
								<span className="plan-comparison-grid__plan-subtitle">
									{ feature.getCompareTitle() }
								</span>
							) }
							{ hasConditionalFeature && feature?.getConditionalTitle && (
								<span className="plan-comparison-grid__plan-conditional-title">
									{ feature?.getConditionalTitle( planSlug ) }
								</span>
							) }
							{ hasFeature && feature?.getCompareSubtitle && (
								<span className="plan-comparison-grid__plan-subtitle">
									{ feature.getCompareSubtitle() }
								</span>
							) }
							{ hasFeature && ! hasConditionalFeature && (
								<Gridicon icon="checkmark" color="#0675C4" />
							) }
							{ ! hasFeature && ! hasConditionalFeature && (
								<Gridicon icon="minus-small" color="#C3C4C7" />
							) }
						</>
					) }
				</>
			) }
		</Cell>
	);
};

const PlanComparisonGridFeatureGroupRow: React.FunctionComponent< {
	feature?: FeatureObject | TransformedFeatureObject;
	isHiddenInMobile: boolean;
	allJetpackFeatures: Set< string >;
	visibleGridPlans: GridPlan[];
	planFeatureFootnotes: PlanFeatureFootnotes;
	isStorageFeature: boolean;
	flowName?: string | null;
	isHighlighted: boolean;
	intervalType?: string;
} > = ( {
	feature,
	isHiddenInMobile,
	allJetpackFeatures,
	visibleGridPlans,
	planFeatureFootnotes,
	isStorageFeature,
	flowName,
	isHighlighted,
	intervalType,
} ) => {
	const translate = useTranslate();
	const rowClasses = classNames( 'plan-comparison-grid__feature-group-row', {
		'is-storage-feature': isStorageFeature,
	} );
	const featureSlug = feature?.getSlug() ?? '';
	const footnote = planFeatureFootnotes?.footnotesByFeature?.[ featureSlug ];

	return (
		<Row
			isHiddenInMobile={ isHiddenInMobile }
			className={ rowClasses }
			isHighlighted={ isHighlighted }
		>
			<RowTitleCell key="feature-name" className="is-feature-group-row-title-cell">
				{ isStorageFeature ? (
					<Plans2023Tooltip text={ translate( 'Space to store your photos, media, and more.' ) }>
						{ translate( 'Storage' ) }
					</Plans2023Tooltip>
				) : (
					<>
						{ feature && (
							<>
								<Plans2023Tooltip text={ feature.getDescription?.() }>
									{ feature.getTitle() }
									{ footnote && (
										<FeatureFootnote>
											<sup>{ footnote }</sup>
										</FeatureFootnote>
									) }
								</Plans2023Tooltip>
								{ allJetpackFeatures.has( feature.getSlug() ) ? (
									<JetpackIconContainer>
										<JetpackLogo size={ 16 } />
									</JetpackIconContainer>
								) : null }
							</>
						) }
					</>
				) }
			</RowTitleCell>
			{ visibleGridPlans.map( ( { planSlug } ) => (
				<PlanComparisonGridFeatureGroupRowCell
					key={ planSlug }
					feature={ feature }
					allJetpackFeatures={ allJetpackFeatures }
					visibleGridPlans={ visibleGridPlans }
					planSlug={ planSlug }
					isStorageFeature={ isStorageFeature }
					flowName={ flowName }
					intervalType={ intervalType }
				/>
			) ) }
		</Row>
	);
};

export const PlanComparisonGrid = ( {
	intervalType,
	planTypeSelectorProps,
	isInSignup,
	isLaunchPage,
	flowName,
	currentSitePlanSlug,
	manageHref,
	canUserPurchasePlan,
	selectedSiteSlug,
	onUpgradeClick,
	siteId,
	planActionOverrides,
	selectedPlan,
	selectedFeature,
}: PlanComparisonGridProps ) => {
	const translate = useTranslate();
	const { gridPlans, allFeaturesList } = usePlansGridContext();

	// Check to see if we have at least one Woo Express plan we're comparing.
	const hasWooExpressFeatures = useMemo( () => {
		const wooExpressPlans = gridPlans.filter(
			( { planSlug, isVisible } ) => isVisible && isWooExpressPlan( planSlug )
		);

		return wooExpressPlans.length > 0;
	}, [ gridPlans ] );

	// If we have a Woo Express plan, use the Woo Express feature groups, otherwise use the regular feature groups.
	const featureGroupMap = hasWooExpressFeatures
		? getWooExpressFeaturesGrouped()
		: getPlanFeaturesGrouped();

	let largeBreakpoint;
	let mediumBreakpoint;
	let smallBreakpoint;

	if ( isInSignup ) {
		// Breakpoints without admin sidebar
		largeBreakpoint = 1281;
		mediumBreakpoint = 1024;
		smallBreakpoint = 880;
	} else {
		// Breakpoints with admin sidebar
		largeBreakpoint = 1553; // 1500px + 272px (sidebar)
		mediumBreakpoint = 1296; // 1340px + 272px (sidebar)
		smallBreakpoint = 1152; // keeping original breakpoint to match Plan Grid
	}

	const isLargeBreakpoint = usePricingBreakpoint( largeBreakpoint );
	const isMediumBreakpoint = usePricingBreakpoint( mediumBreakpoint );
	const isSmallBreakpoint = usePricingBreakpoint( smallBreakpoint );

	const [ visiblePlans, setVisiblePlans ] = useState< PlanSlug[] >( [] );
	const [ firstSetOfFeatures ] = Object.keys( featureGroupMap );
	const [ visibleFeatureGroups, setVisibleFeatureGroups ] = useState< string[] >( [
		firstSetOfFeatures,
	] );

	const displayedGridPlans = useMemo( () => {
		const hiddenPlans = [ PLAN_WOOEXPRESS_PLUS, PLAN_ENTERPRISE_GRID_WPCOM ];
		const filteredPlans = gridPlans.filter(
			( { planSlug, isVisible } ) => isVisible && ! hiddenPlans.includes( planSlug )
		);

		return sortPlans( filteredPlans, currentSitePlanSlug, isMediumBreakpoint );
	}, [ gridPlans, currentSitePlanSlug, isMediumBreakpoint ] );

	useEffect( () => {
		let newVisiblePlans = displayedGridPlans.map( ( { planSlug } ) => planSlug );
		let visibleLength = newVisiblePlans.length;

		visibleLength = isLargeBreakpoint ? 4 : visibleLength;
		visibleLength = isMediumBreakpoint ? 3 : visibleLength;
		visibleLength = isSmallBreakpoint ? 2 : visibleLength;

		if ( newVisiblePlans.length !== visibleLength ) {
			newVisiblePlans = newVisiblePlans.slice( 0, visibleLength );
		}

		setVisiblePlans( newVisiblePlans );
	}, [ isLargeBreakpoint, isMediumBreakpoint, isSmallBreakpoint, displayedGridPlans, isInSignup ] );

	const planFeatureFootnotes = useMemo( () => {
		// This is the main list of all footnotes. It is displayed at the bottom of the comparison grid.
		const footnoteList: string[] = [];
		// This is a map of features to the index of the footnote in the main list of footnotes.
		const footnotesByFeature: Record< Feature, number > = {};

		Object.values( featureGroupMap ).map( ( featureGroup ) => {
			const footnotes = featureGroup?.getFootnotes?.();

			if ( ! footnotes ) {
				return;
			}

			Object.keys( footnotes ).map( ( footnote ) => {
				const footnoteFeatures = footnotes[ footnote ];

				// First we add the footnote to the main list of footnotes.
				footnoteList.push( footnote );

				// Then we add each feature that has this footnote to the map of footnotes by feature.
				const currentFootnoteIndex = footnoteList.length;
				footnoteFeatures.map( ( feature ) => {
					footnotesByFeature[ feature ] = currentFootnoteIndex;
				} );
			} );
		} );

		return {
			footnoteList,
			footnotesByFeature,
		};
	}, [ featureGroupMap ] );

	const allJetpackFeatures = useMemo( () => {
		const allPlans = getPlans();
		const jetpackFeatures = new Set(
			Object.values( allPlans )
				.map(
					( {
						get2023PricingGridSignupJetpackFeatures,
						get2023PlanComparisonJetpackFeatureOverride,
					} ) => {
						const jetpackFeatures = get2023PricingGridSignupJetpackFeatures?.();
						const additionalJetpackFeatures = get2023PlanComparisonJetpackFeatureOverride?.();

						return [
							...( jetpackFeatures ? jetpackFeatures : [] ),
							...( additionalJetpackFeatures ? additionalJetpackFeatures : [] ),
						];
					}
				)
				.flat()
		);

		return jetpackFeatures;
	}, [] );

	const onPlanChange = useCallback(
		( currentPlan: PlanSlug, event: ChangeEvent< HTMLSelectElement > ) => {
			const newPlan = event.currentTarget.value;
			const newVisiblePlans = visiblePlans.map( ( plan ) =>
				plan === currentPlan ? ( newPlan as PlanSlug ) : plan
			);

			setVisiblePlans( newVisiblePlans );
		},
		[ visiblePlans ]
	);

	const toggleFeatureGroup = ( featureGroupSlug: string ) => {
		const index = visibleFeatureGroups.indexOf( featureGroupSlug );
		const newVisibleFeatureGroups = [ ...visibleFeatureGroups ];

		if ( index === -1 ) {
			newVisibleFeatureGroups.push( featureGroupSlug );
		} else {
			newVisibleFeatureGroups.splice( index, 1 );
		}

		setVisibleFeatureGroups( newVisibleFeatureGroups );
	};

	const visibleGridPlans = visiblePlans.reduce( ( acc, planSlug ) => {
		const gridPlan = displayedGridPlans.find( ( gridPlan ) => gridPlan.planSlug === planSlug );

		if ( gridPlan ) {
			acc.push( gridPlan );
		}

		return acc;
	}, [] as GridPlan[] );

	return (
		<div className="plan-comparison-grid">
			<PlanComparisonHeader className="wp-brand-font">
				{ translate( 'Compare our plans and find yours' ) }
			</PlanComparisonHeader>
			<PlanTypeSelector
				{ ...planTypeSelectorProps }
				kind="interval"
				plans={ displayedGridPlans.map( ( { planSlug } ) => planSlug ) }
			/>
			<Grid isInSignup={ isInSignup }>
				<PlanComparisonGridHeader
					siteId={ siteId }
					displayedGridPlans={ displayedGridPlans }
					visibleGridPlans={ visibleGridPlans }
					isInSignup={ isInSignup }
					isLaunchPage={ isLaunchPage }
					flowName={ flowName }
					onPlanChange={ onPlanChange }
					currentSitePlanSlug={ currentSitePlanSlug }
					manageHref={ manageHref }
					canUserPurchasePlan={ canUserPurchasePlan }
					selectedSiteSlug={ selectedSiteSlug }
					onUpgradeClick={ onUpgradeClick }
					planActionOverrides={ planActionOverrides }
					selectedPlan={ selectedPlan }
				/>
				{ Object.values( featureGroupMap ).map( ( featureGroup: FeatureGroup ) => {
					const features = featureGroup.get2023PricingGridSignupWpcomFeatures();
					const featureObjects = getPlanFeaturesObject( allFeaturesList, features );
					const isHiddenInMobile = ! visibleFeatureGroups.includes( featureGroup.slug );

					return (
						<div key={ featureGroup.slug } className="plan-comparison-grid__feature-group">
							<TitleRow
								className="plan-comparison-grid__feature-group-title-row"
								onClick={ () => toggleFeatureGroup( featureGroup.slug ) }
							>
								<Title isHiddenInMobile={ isHiddenInMobile }>
									<Gridicon icon="chevron-up" size={ 12 } color="#1E1E1E" />
									{ featureGroup.getTitle() }
								</Title>
							</TitleRow>
							{ featureObjects.map( ( feature ) => (
								<PlanComparisonGridFeatureGroupRow
									key={ feature.getSlug() }
									feature={ feature }
									isHiddenInMobile={ isHiddenInMobile }
									allJetpackFeatures={ allJetpackFeatures }
									visibleGridPlans={ visibleGridPlans }
									planFeatureFootnotes={ planFeatureFootnotes }
									isStorageFeature={ false }
									flowName={ flowName }
									isHighlighted={ feature.getSlug() === selectedFeature }
									intervalType={ intervalType }
								/>
							) ) }
							{ featureGroup.slug === FEATURE_GROUP_ESSENTIAL_FEATURES ? (
								<PlanComparisonGridFeatureGroupRow
									key="feature-storage"
									isHiddenInMobile={ isHiddenInMobile }
									allJetpackFeatures={ allJetpackFeatures }
									visibleGridPlans={ visibleGridPlans }
									planFeatureFootnotes={ planFeatureFootnotes }
									isStorageFeature={ true }
									flowName={ flowName }
									isHighlighted={ false }
									intervalType={ intervalType }
								/>
							) : null }
						</div>
					);
				} ) }
				<PlanComparisonGridHeader
					displayedGridPlans={ displayedGridPlans }
					visibleGridPlans={ visibleGridPlans }
					isInSignup={ isInSignup }
					isLaunchPage={ isLaunchPage }
					flowName={ flowName }
					isFooter={ true }
					onPlanChange={ onPlanChange }
					currentSitePlanSlug={ currentSitePlanSlug }
					manageHref={ manageHref }
					canUserPurchasePlan={ canUserPurchasePlan }
					selectedSiteSlug={ selectedSiteSlug }
					onUpgradeClick={ onUpgradeClick }
					siteId={ siteId }
					planActionOverrides={ planActionOverrides }
					selectedPlan={ selectedPlan }
				/>
			</Grid>

			<div className="plan-comparison-grid__footer">
				{ planFeatureFootnotes?.footnoteList && (
					<FeatureFootnotes>
						<ol>
							{ planFeatureFootnotes?.footnoteList?.map( ( footnote, index ) => {
								return <li key={ `${ footnote }-${ index }` }>{ footnote }</li>;
							} ) }
						</ol>
					</FeatureFootnotes>
				) }
			</div>
		</div>
	);
};
