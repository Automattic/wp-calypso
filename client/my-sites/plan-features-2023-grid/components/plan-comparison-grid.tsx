import {
	applyTestFiltersToPlansList,
	Feature,
	FeatureGroup,
	getPlanClass,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	isWooExpressPlan,
	FEATURE_GROUP_ESSENTIAL_FEATURES,
	PLAN_WOOEXPRESS_PLUS,
	getPlanFeaturesGrouped,
	getWooExpressFeaturesGrouped,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PlanSlug,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback, useEffect, ChangeEvent } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { FeatureObject, getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import { PlanTypeSelectorProps } from 'calypso/my-sites/plans-features-main/components/plan-type-selector';
import TermExperimentPlanTypeSelector from 'calypso/my-sites/plans-features-main/components/term-experiment-plan-type-selector';
import useIsLargeCurrency from '../../plans/hooks/use-is-large-currency';
import useHighlightAdjacencyMatrix from '../hooks/use-highlight-adjacency-matrix';
import useHighlightLabel from '../hooks/use-highlight-label';
import { sortPlans } from '../lib/sort-plan-properties';
import { plansBreakSmall } from '../media-queries';
import { PlanProperties } from '../types';
import { usePricingBreakpoint } from '../util';
import PlanFeatures2023GridActions from './actions';
import PlanFeatures2023GridBillingTimeframe from './billing-timeframe';
import PlanFeatures2023GridHeaderPrice from './header-price';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import PopularBadge from './popular-badge';

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

const Grid = styled.div< { isInSignup: boolean } >`
	display: grid;
	margin-top: ${ ( props ) => ( props.isInSignup ? '90px' : '64px' ) };
	background: #fff;
	border: solid 1px #e0e0e0;

	${ plansBreakSmall( css`
		border-radius: 5px;
	` ) }
`;

const Row = styled.div< { isHiddenInMobile?: boolean; className?: string } >`
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
	planProperties?: Array< PlanProperties >;
	intervalType: string;
	planTypeSelectorProps: PlanTypeSelectorProps;
	isInSignup: boolean;
	isLaunchPage?: boolean;
	flowName: string;
	currentSitePlanSlug?: string;
	manageHref: string;
	canUserPurchasePlan: boolean;
	selectedSiteSlug: string | null;
	onUpgradeClick: ( properties: PlanProperties ) => void;
};

type PlanComparisonGridHeaderProps = {
	displayedPlansProperties: Array< PlanProperties >;
	visiblePlansProperties: Array< PlanProperties >;
	isInSignup: boolean;
	isLaunchPage?: boolean;
	isFooter?: boolean;
	flowName: string;
	onPlanChange: ( currentPlan: string, event: ChangeEvent ) => void;
	currentSitePlanSlug?: string;
	manageHref: string;
	canUserPurchasePlan: boolean;
	selectedSiteSlug: string | null;
	onUpgradeClick: ( properties: PlanProperties ) => void;
};

type RestructuredFeatures = {
	featureMap: Record< string, Set< string > >;
	conditionalFeatureMap: Record< string, Set< string > >;
	planStorageOptionsMap: Record< string, string >;
};

type RestructuredFootnotes = {
	footnoteList: string[];
	footnotesByFeature: Record< Feature, number >;
};

const PlanComparisonGridHeaderCell: React.FunctionComponent<
	PlanComparisonGridHeaderProps & {
		planProperties: PlanProperties;
		allVisible: boolean;
		isLastInRow: boolean;
		isLargeCurrency: boolean;
	}
> = ( {
	planProperties,
	allVisible,
	isLastInRow,
	isFooter,
	isInSignup,
	visiblePlansProperties,
	onPlanChange,
	displayedPlansProperties,
	currentSitePlanSlug,
	manageHref,
	canUserPurchasePlan,
	isLaunchPage,
	flowName,
	selectedSiteSlug,
	isLargeCurrency,
	onUpgradeClick,
} ) => {
	const { planName, planConstantObj, availableForPurchase, current, ...planPropertiesObj } =
		planProperties;
	const highlightLabel = useHighlightLabel( planName, flowName );
	const highlightAdjacencyMatrix = useHighlightAdjacencyMatrix(
		visiblePlansProperties,
		flowName,
		currentSitePlanSlug
	);
	const headerClasses = classNames( 'plan-comparison-grid__header-cell', getPlanClass( planName ), {
		'popular-plan-parent-class': highlightLabel,
		'is-last-in-row': isLastInRow,
		'plan-is-footer': isFooter,
		'is-left-of-highlight': highlightAdjacencyMatrix[ planName ]?.leftOfHighlight,
		'is-right-of-highlight': highlightAdjacencyMatrix[ planName ]?.rightOfHighlight,
		'is-only-highlight': highlightAdjacencyMatrix[ planName ]?.isOnlyHighlight,
		'is-current-plan': current,
	} );
	const popularBadgeClasses = classNames( {
		'is-current-plan': current,
	} );
	const showPlanSelect = ! allVisible && ! current;

	return (
		<Cell className={ headerClasses } textAlign="start">
			<PopularBadge
				isInSignup={ isInSignup }
				planName={ planName }
				additionalClassName={ popularBadgeClasses }
				flowName={ flowName }
			/>
			<PlanSelector>
				{ showPlanSelect && (
					<select
						onChange={ ( event: ChangeEvent ) => onPlanChange( planName, event ) }
						className="plan-comparison-grid__title-select"
						value={ planName }
					>
						{ displayedPlansProperties.map( ( { planName: otherPlan, planConstantObj } ) => {
							const isVisiblePlan = visiblePlansProperties.find(
								( { planName } ) => planName === otherPlan
							);

							if ( isVisiblePlan && otherPlan !== planName ) {
								return null;
							}

							return (
								<option key={ otherPlan } value={ otherPlan }>
									{ planConstantObj.getTitle() }
								</option>
							);
						} ) }
					</select>
				) }
				<h4 className="plan-comparison-grid__title">
					<span>{ planConstantObj.getTitle() }</span>
					{ showPlanSelect && <DropdownIcon /> }
				</h4>
			</PlanSelector>
			<PlanFeatures2023GridHeaderPrice
				planProperties={ planProperties }
				is2023OnboardingPricingGrid={ true }
				isLargeCurrency={ isLargeCurrency }
			/>
			<div className="plan-comparison-grid__billing-info">
				<PlanFeatures2023GridBillingTimeframe
					planName={ planName }
					isMonthlyPlan={ planPropertiesObj.isMonthlyPlan }
					billingTimeframe={ planConstantObj.getBillingTimeFrame() }
					billingPeriod={ planPropertiesObj.billingPeriod }
				/>
			</div>
			<PlanFeatures2023GridActions
				currentSitePlanSlug={ currentSitePlanSlug }
				manageHref={ manageHref }
				canUserPurchasePlan={ canUserPurchasePlan }
				current={ current ?? false }
				availableForPurchase={ availableForPurchase }
				className={ getPlanClass( planName ) }
				freePlan={ isFreePlan( planName ) }
				isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( planName ) }
				isPlaceholder={ planPropertiesObj.isPlaceholder }
				isInSignup={ isInSignup }
				isLaunchPage={ isLaunchPage }
				planName={ planConstantObj.getTitle() }
				planType={ planName }
				flowName={ flowName }
				selectedSiteSlug={ selectedSiteSlug }
				onUpgradeClick={ () => onUpgradeClick( planProperties ) }
			/>
		</Cell>
	);
};

const PlanComparisonGridHeader: React.FC< PlanComparisonGridHeaderProps > = ( {
	displayedPlansProperties,
	visiblePlansProperties,
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
} ) => {
	const allVisible = visiblePlansProperties.length === displayedPlansProperties.length;

	const isLargeCurrency = useIsLargeCurrency(
		displayedPlansProperties.map( ( properties ) => properties.planName as PlanSlug )
	);

	return (
		<PlanRow>
			<RowTitleCell
				key="feature-name"
				className="plan-comparison-grid__header-cell plan-comparison-grid__interval-toggle is-placeholder-header-cell"
			/>
			{ visiblePlansProperties.map( ( planProperties, index ) => (
				<PlanComparisonGridHeaderCell
					key={ planProperties.planName }
					planProperties={ planProperties }
					isLastInRow={ index === visiblePlansProperties.length - 1 }
					isFooter={ isFooter }
					allVisible={ allVisible }
					isInSignup={ isInSignup }
					visiblePlansProperties={ visiblePlansProperties }
					onPlanChange={ onPlanChange }
					displayedPlansProperties={ displayedPlansProperties }
					currentSitePlanSlug={ currentSitePlanSlug }
					manageHref={ manageHref }
					canUserPurchasePlan={ canUserPurchasePlan }
					flowName={ flowName }
					selectedSiteSlug={ selectedSiteSlug }
					onUpgradeClick={ onUpgradeClick }
					isLaunchPage={ isLaunchPage }
					isLargeCurrency={ isLargeCurrency }
				/>
			) ) }
		</PlanRow>
	);
};

const PlanComparisonGridFeatureGroupRowCell: React.FunctionComponent< {
	feature?: FeatureObject;
	allJetpackFeatures: Set< string >;
	visiblePlansProperties: PlanProperties[];
	restructuredFeatures: RestructuredFeatures;
	planName: string;
	isStorageFeature: boolean;
	flowName: string;
	currentSitePlanSlug?: string;
} > = ( {
	feature,
	visiblePlansProperties,
	restructuredFeatures,
	planName,
	isStorageFeature,
	flowName,
	currentSitePlanSlug,
} ) => {
	const translate = useTranslate();
	const highlightAdjacencyMatrix = useHighlightAdjacencyMatrix(
		visiblePlansProperties,
		flowName,
		currentSitePlanSlug
	);
	const highlightLabel = useHighlightLabel( planName, flowName );
	const featureSlug = feature?.getSlug();
	const hasFeature =
		isStorageFeature ||
		( featureSlug ? restructuredFeatures.featureMap[ planName ].has( featureSlug ) : false );
	const hasConditionalFeature = featureSlug
		? restructuredFeatures.conditionalFeatureMap[ planName ].has( featureSlug )
		: false;
	const [ storageFeature ] = getPlanFeaturesObject( [
		restructuredFeatures.planStorageOptionsMap[ planName ],
	] );
	const cellClasses = classNames(
		'plan-comparison-grid__feature-group-row-cell',
		'plan-comparison-grid__plan',
		getPlanClass( planName ),
		{
			'popular-plan-parent-class': highlightLabel,
			'has-feature': hasFeature,
			'has-conditional-feature': hasConditionalFeature,
			'title-is-subtitle': 'live-chat-support' === featureSlug,
			'is-left-of-highlight': highlightAdjacencyMatrix[ planName ]?.leftOfHighlight,
			'is-right-of-highlight': highlightAdjacencyMatrix[ planName ]?.rightOfHighlight,
			'is-only-highlight': highlightAdjacencyMatrix[ planName ]?.isOnlyHighlight,
		}
	);

	return (
		<Cell className={ cellClasses } textAlign="center">
			{ isStorageFeature ? (
				<>
					<span className="plan-comparison-grid__plan-title">{ translate( 'Storage' ) }</span>
					<StorageButton className="plan-features-2023-grid__storage-button" key={ planName }>
						{ storageFeature?.getCompareTitle?.() }
					</StorageButton>
				</>
			) : (
				<>
					{ feature?.getIcon && (
						<span className="plan-comparison-grid__plan-image">{ feature.getIcon() }</span>
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
							{ feature?.getConditionalTitle( planName ) }
						</span>
					) }
					{ hasFeature && feature?.getCompareSubtitle && (
						<span className="plan-comparison-grid__plan-subtitle">
							{ feature.getCompareSubtitle() }
						</span>
					) }
					{ hasFeature && ! hasConditionalFeature && <Gridicon icon="checkmark" color="#0675C4" /> }
					{ ! hasFeature && ! hasConditionalFeature && (
						<Gridicon icon="minus-small" color="#C3C4C7" />
					) }
				</>
			) }
		</Cell>
	);
};

const PlanComparisonGridFeatureGroupRow: React.FunctionComponent< {
	feature?: FeatureObject;
	isHiddenInMobile: boolean;
	allJetpackFeatures: Set< string >;
	visiblePlansProperties: PlanProperties[];
	restructuredFeatures: RestructuredFeatures;
	restructuredFootnotes: RestructuredFootnotes;
	isStorageFeature: boolean;
	flowName: string;
	currentSitePlanSlug?: string;
} > = ( {
	feature,
	isHiddenInMobile,
	allJetpackFeatures,
	visiblePlansProperties,
	restructuredFeatures,
	restructuredFootnotes,
	isStorageFeature,
	flowName,
	currentSitePlanSlug,
} ) => {
	const translate = useTranslate();
	const rowClasses = classNames( 'plan-comparison-grid__feature-group-row', {
		'is-storage-feature': isStorageFeature,
	} );
	const featureSlug = feature?.getSlug() || '';
	const footnote = restructuredFootnotes?.footnotesByFeature?.[ featureSlug ];

	return (
		<Row isHiddenInMobile={ isHiddenInMobile } className={ rowClasses }>
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
			{ ( visiblePlansProperties ?? [] ).map( ( { planName } ) => (
				<PlanComparisonGridFeatureGroupRowCell
					key={ planName }
					feature={ feature }
					allJetpackFeatures={ allJetpackFeatures }
					visiblePlansProperties={ visiblePlansProperties }
					restructuredFeatures={ restructuredFeatures }
					planName={ planName }
					isStorageFeature={ isStorageFeature }
					flowName={ flowName }
					currentSitePlanSlug={ currentSitePlanSlug }
				/>
			) ) }
		</Row>
	);
};

export const PlanComparisonGrid: React.FC< PlanComparisonGridProps > = ( {
	planProperties,
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
} ) => {
	const translate = useTranslate();
	// Check to see if we have at least one Woo Express plan we're comparing.
	const hasWooExpressFeatures = useMemo( () => {
		const plans = ( planProperties ?? [] ).filter(
			( { planName, isVisible } ) => isVisible && isWooExpressPlan( planName )
		);

		return plans.length > 0;
	}, [ planProperties ] );
	// If we have a Woo Express plan, use the Woo Express feature groups, otherwise use the regular feature groups.
	const featureGroupMap = hasWooExpressFeatures
		? getWooExpressFeaturesGrouped()
		: getPlanFeaturesGrouped();
	const hiddenPlans = useMemo( () => [ PLAN_WOOEXPRESS_PLUS, PLAN_ENTERPRISE_GRID_WPCOM ], [] );

	const isMonthly = intervalType === 'monthly';
	const isLargestBreakpoint = usePricingBreakpoint( 1772 ); // 1500px + 272px (sidebar)
	const isLargeBreakpoint = usePricingBreakpoint( 1612 ); // 1340px + 272px (sidebar)
	const isMediumBreakpoint = usePricingBreakpoint( 1340 ); // keeping original breakpoint to match Plan Grid

	const [ visiblePlans, setVisiblePlans ] = useState< string[] >( [] );
	const [ firstSetOfFeatures ] = Object.keys( featureGroupMap );
	const [ visibleFeatureGroups, setVisibleFeatureGroups ] = useState< string[] >( [
		firstSetOfFeatures,
	] );

	const displayedPlansProperties = useMemo( () => {
		const filteredPlanProperties = ( planProperties ?? [] ).filter(
			( { planName, isVisible } ) => isVisible && ! hiddenPlans.includes( planName )
		);
		const sortedPlanProperties = sortPlans(
			filteredPlanProperties,
			currentSitePlanSlug,
			isMediumBreakpoint
		);
		return sortedPlanProperties;
	}, [ planProperties, currentSitePlanSlug, isMediumBreakpoint, hiddenPlans ] );

	useEffect( () => {
		let newVisiblePlans = displayedPlansProperties.map( ( { planName } ) => planName );

		let visibleLength = newVisiblePlans.length;
		if ( ! isInSignup ) {
			visibleLength = isLargestBreakpoint ? 4 : visibleLength;
			visibleLength = isLargeBreakpoint ? 3 : visibleLength;
		}

		visibleLength = isMediumBreakpoint ? 2 : visibleLength;

		if ( newVisiblePlans.length !== visibleLength ) {
			newVisiblePlans = newVisiblePlans.slice( 0, visibleLength );
		}

		setVisiblePlans( newVisiblePlans );
	}, [
		isLargestBreakpoint,
		isLargeBreakpoint,
		isMediumBreakpoint,
		displayedPlansProperties,
		isInSignup,
	] );

	const restructuredFootnotes = useMemo( () => {
		// This is the main list of all footnotes. It is displayed at the bottom of the comparison grid.
		const footnoteList: string[] = [];
		// This is a map of features to the index of the footnote in the main list of footnotes.
		const footnotesByFeature: Record< Feature, number > = {};

		Object.values( featureGroupMap ).map( ( featureGroup: FeatureGroup ) => {
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

	const restructuredFeatures = useMemo( () => {
		let previousPlan = null;
		const planFeatureMap: Record< string, Set< string > > = {};
		const conditionalFeatureMap: Record< string, Set< string > > = {};
		const planStorageOptionsMap: Record< string, string > = {};

		for ( const plan of planProperties ?? [] ) {
			const { planName } = plan;
			const planObject = applyTestFiltersToPlansList( planName, undefined );

			const wpcomFeatures = planObject.get2023PlanComparisonFeatureOverride
				? planObject.get2023PlanComparisonFeatureOverride().slice()
				: planObject.get2023PricingGridSignupWpcomFeatures?.().slice() ?? [];

			const jetpackFeatures = planObject.get2023PlanComparisonJetpackFeatureOverride
				? planObject.get2023PlanComparisonJetpackFeatureOverride().slice()
				: planObject.get2023PricingGridSignupJetpackFeatures?.().slice() ?? [];

			const annualOnlyFeatures = planObject.getAnnualPlansOnlyFeatures?.() ?? [];

			let featuresAvailable = isWooExpressPlan( planName )
				? [ ...wpcomFeatures ]
				: [ ...wpcomFeatures, ...jetpackFeatures ];
			if ( isMonthly ) {
				// Filter out features only available annually
				featuresAvailable = featuresAvailable.filter(
					( feature ) => ! annualOnlyFeatures.includes( feature )
				);
			}
			planFeatureMap[ planName ] = new Set( featuresAvailable );

			// Add previous plan feature
			if ( previousPlan !== null ) {
				planFeatureMap[ planName ] = new Set( [
					...planFeatureMap[ planName ],
					...planFeatureMap[ previousPlan ],
				] );
			}
			previousPlan = planName;
			const [ storageOption ] = planObject.get2023PricingGridSignupStorageOptions?.() ?? [];
			planStorageOptionsMap[ planName ] = storageOption;

			conditionalFeatureMap[ planName ] = new Set(
				planObject.get2023PlanComparisonConditionalFeatures?.() ?? []
			);
		}
		return { featureMap: planFeatureMap, planStorageOptionsMap, conditionalFeatureMap };
	}, [ planProperties, isMonthly ] );

	const allJetpackFeatures = useMemo( () => {
		const jetpackFeatures = new Set(
			( planProperties ?? [] )
				.map( ( plan ) => {
					const { planName } = plan;
					const planObject = applyTestFiltersToPlansList( planName, undefined );
					const jetpackFeatures = planObject.get2023PricingGridSignupJetpackFeatures?.() ?? [];
					const additionalJetpackFeatures =
						planObject.get2023PlanComparisonJetpackFeatureOverride?.() ?? [];
					return jetpackFeatures.concat( ...additionalJetpackFeatures );
				} )
				.flat()
		);

		return jetpackFeatures;
	}, [ planProperties ] );

	const onPlanChange = useCallback(
		( currentPlan, event ) => {
			const newPlan = event.currentTarget.value;

			const newVisiblePlans = visiblePlans.map( ( plan ) =>
				plan === currentPlan ? newPlan : plan
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

	const visiblePlansProperties = visiblePlans.reduce< PlanProperties[] >( ( acc, planName ) => {
		const plan = displayedPlansProperties.find( ( plan ) => plan.planName === planName );
		if ( plan ) {
			acc.push( plan );
		}
		return acc;
	}, [] );

	return (
		<div className="plan-comparison-grid">
			<PlanComparisonHeader className="wp-brand-font">
				{ translate( 'Compare our plans and find yours' ) }
			</PlanComparisonHeader>
			<TermExperimentPlanTypeSelector
				isEligible={ true }
				kind="interval"
				plans={ displayedPlansProperties.map( ( { planName } ) => planName ) }
				planTypeSelectorProps={ planTypeSelectorProps }
			/>
			<Grid isInSignup={ isInSignup }>
				<PlanComparisonGridHeader
					displayedPlansProperties={ displayedPlansProperties }
					visiblePlansProperties={ visiblePlansProperties }
					isInSignup={ isInSignup }
					isLaunchPage={ isLaunchPage }
					flowName={ flowName }
					onPlanChange={ onPlanChange }
					currentSitePlanSlug={ currentSitePlanSlug }
					manageHref={ manageHref }
					canUserPurchasePlan={ canUserPurchasePlan }
					selectedSiteSlug={ selectedSiteSlug }
					onUpgradeClick={ onUpgradeClick }
				/>
				{ Object.values( featureGroupMap ).map( ( featureGroup: FeatureGroup ) => {
					const features = featureGroup.get2023PricingGridSignupWpcomFeatures();
					const featureObjects = getPlanFeaturesObject( features );
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
									visiblePlansProperties={ visiblePlansProperties }
									restructuredFeatures={ restructuredFeatures }
									restructuredFootnotes={ restructuredFootnotes }
									isStorageFeature={ false }
									flowName={ flowName }
									currentSitePlanSlug={ currentSitePlanSlug }
								/>
							) ) }
							{ featureGroup.slug === FEATURE_GROUP_ESSENTIAL_FEATURES ? (
								<PlanComparisonGridFeatureGroupRow
									key="feature-storage"
									isHiddenInMobile={ isHiddenInMobile }
									allJetpackFeatures={ allJetpackFeatures }
									visiblePlansProperties={ visiblePlansProperties }
									restructuredFeatures={ restructuredFeatures }
									restructuredFootnotes={ restructuredFootnotes }
									isStorageFeature={ true }
									flowName={ flowName }
									currentSitePlanSlug={ currentSitePlanSlug }
								/>
							) : null }
						</div>
					);
				} ) }
				<PlanComparisonGridHeader
					displayedPlansProperties={ displayedPlansProperties }
					visiblePlansProperties={ visiblePlansProperties }
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
				/>
			</Grid>

			<div className="plan-comparison-grid__footer">
				{ restructuredFootnotes?.footnoteList && (
					<FeatureFootnotes>
						<ol>
							{ restructuredFootnotes?.footnoteList?.map( ( footnote, index ) => {
								return <li key={ `${ footnote }-${ index }` }>{ footnote }</li>;
							} ) }
						</ol>
					</FeatureFootnotes>
				) }
			</div>
		</div>
	);
};
