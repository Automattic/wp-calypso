import {
	getPlanClass,
	FEATURE_GROUP_ESSENTIAL_FEATURES,
	FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	getPlans,
} from '@automattic/calypso-products';
import { Gridicon, JetpackLogo } from '@automattic/components';
import { AddOns } from '@automattic/data-stores';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useRef, useMemo } from '@wordpress/element';
import { Icon, chevronRightSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import {
	useState,
	useCallback,
	useEffect,
	ChangeEvent,
	Dispatch,
	SetStateAction,
	forwardRef,
} from 'react';
import { useInView } from 'react-intersection-observer';
import { plansGridMediumLarge } from '../../css-mixins';
import PlansGridContextProvider, { usePlansGridContext } from '../../grid-context';
import useGridSize from '../../hooks/use-grid-size';
import useHighlightAdjacencyMatrix from '../../hooks/use-highlight-adjacency-matrix';
import { useManageTooltipToggle } from '../../hooks/use-manage-tooltip-toggle';
import filterUnusedFeaturesObject from '../../lib/filter-unused-features-object';
import getPlanFeaturesObject from '../../lib/get-plan-features-object';
import { sortPlans } from '../../lib/sort-plan-properties';
import PlanTypeSelector from '../plan-type-selector';
import { Plans2023Tooltip } from '../plans-2023-tooltip';
import PopularBadge from '../popular-badge';
import ActionButton from '../shared/action-button';
import BillingTimeframe from '../shared/billing-timeframe';
import HeaderPrice from '../shared/header-price';
import { PlanStorage } from '../shared/storage';
import { StickyContainer } from '../sticky-container';
import type {
	GridPlan,
	ComparisonGridExternalProps,
	ComparisonGridProps,
	PlanActionOverrides,
	TransformedFeatureObject,
	PlanTypeSelectorProps,
} from '../../types';
import type {
	FeatureObject,
	Feature,
	FeatureGroup,
	PlanSlug,
	FeatureGroupMap,
} from '@automattic/calypso-products';

import './style.scss';

const featureGroupRowTitleCellMaxWidth = 450;
const rowCellMaxWidth = 290;

const JetpackIconContainer = styled.div`
	padding-inline-start: 6px;
	display: inline-block;
	vertical-align: middle;
	line-height: 1;
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
		flex-shrink: 0;
	}

	${ plansGridMediumLarge( css`
		padding-inline-start: 0;
		border: none;
		padding: 0;
		max-width: 290px;

		.gridicon {
			display: none;
		}
	` ) }
`;

const Grid = styled.div< { visiblePlans: number } >`
	display: grid;
	margin: 0 auto;
	background: #fff;
	border: solid 1px #e0e0e0;
	${ ( props ) =>
		props.visiblePlans &&
		css`
			max-width: ${ rowCellMaxWidth * props.visiblePlans + featureGroupRowTitleCellMaxWidth }px;
		` }

	${ plansGridMediumLarge( css`
		border-radius: 5px;
	` ) }

	> .is-sticky-header-row {
		border-bottom: solid 1px #e0e0e0;
		background: #fff;
	}
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

	${ plansGridMediumLarge( css`
		display: flex;
		align-items: center;
		margin: 0 20px;
		padding: 12px 0;
		border-bottom: 1px solid #eee;
	` ) }

	${ ( props ) =>
		props.isHighlighted &&
		css`
			${ plansGridMediumLarge( css`
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
		display: ${ ( props ) => ( props.isHiddenInMobile ? 'none' : 'flex' ) };
	}

	${ plansGridMediumLarge( css`
		border-bottom: none;
		align-items: stretch;

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

	${ plansGridMediumLarge( css`
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
	max-width: ${ rowCellMaxWidth }px;

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

		${ plansGridMediumLarge( css`
			padding-bottom: 0px;
		` ) }
	}

	${ plansGridMediumLarge( css`
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

		&.is-stuck {
			padding-bottom: 16px;
		}
	` ) }
`;

const RowTitleCell = styled.div< {
	isPlaceholderHeaderCell?: boolean;
	isFeatureGroupRowTitleCell?: boolean;
} >`
	display: none;
	font-size: 14px;
	padding-right: 10px;
	${ plansGridMediumLarge( css`
		display: block;
		flex: 1;
		min-width: 290px;
	` ) }
	max-width: ${ ( props ) => {
		if ( props.isPlaceholderHeaderCell || props.isFeatureGroupRowTitleCell ) {
			return `${ featureGroupRowTitleCellMaxWidth }px`;
		}
		return `${ rowCellMaxWidth }px`;
	} };
`;

const PlanSelector = styled.header`
	position: relative;

	.plan-comparison-grid__title {
		&.is-select-trigger {
			display: flex;
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

	.plan-comparison-grid__title-icon {
		position: relative;
		top: -2px;
		left: -2px;
		width: 1px;
		height: 1px;
		overflow: visible;

		svg {
			fill: var( --color-link );
			transform: rotate( 90deg );
		}
	}
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

type ComparisonGridHeaderProps = {
	displayedGridPlans: GridPlan[];
	visibleGridPlans: GridPlan[];
	isInSignup: boolean;
	isFooter?: boolean;
	onPlanChange: ( currentPlan: PlanSlug, event: ChangeEvent< HTMLSelectElement > ) => void;
	currentSitePlanSlug?: string | null;
	planActionOverrides?: PlanActionOverrides;
	selectedPlan?: string;
	showRefundPeriod?: boolean;
	isStuck: boolean;
	isHiddenInMobile?: boolean;
	planTypeSelectorProps?: PlanTypeSelectorProps;
};

type ComparisonGridHeaderCellProps = Omit< ComparisonGridHeaderProps, 'planTypeSelectorProps' > & {
	allVisible: boolean;
	isLastInRow: boolean;
	planSlug: PlanSlug;
};

type PlanFeatureFootnotes = {
	footnoteList: string[];
	footnotesByFeature: Record< Feature, number >;
};

const ComparisonGridHeaderCell = ( {
	planSlug,
	allVisible,
	isLastInRow,
	isFooter,
	isInSignup,
	visibleGridPlans,
	onPlanChange,
	displayedGridPlans,
	currentSitePlanSlug,
	planActionOverrides,
	showRefundPeriod,
	isStuck,
}: ComparisonGridHeaderCellProps ) => {
	const { gridPlansIndex } = usePlansGridContext();
	const gridPlan = gridPlansIndex[ planSlug ];
	const highlightAdjacencyMatrix = useHighlightAdjacencyMatrix( {
		renderedGridPlans: visibleGridPlans,
	} );

	if ( ! gridPlan ) {
		return null;
	}

	const headerClasses = clsx( 'plan-comparison-grid__header-cell', getPlanClass( planSlug ), {
		'popular-plan-parent-class': gridPlan.highlightLabel,
		'is-last-in-row': isLastInRow,
		'plan-is-footer': isFooter,
		'is-left-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.leftOfHighlight,
		'is-right-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.rightOfHighlight,
		'is-only-highlight': highlightAdjacencyMatrix[ planSlug ]?.isOnlyHighlight,
		'is-current-plan': gridPlan.current,
		'is-stuck': isStuck,
	} );
	const popularBadgeClasses = clsx( {
		'is-current-plan': gridPlan.current,
		'popular-badge-is-stuck': isStuck,
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
				<h4
					className={ clsx( 'plan-comparison-grid__title', showPlanSelect && 'is-select-trigger' ) }
				>
					<span className="plan-comparison-grid__title-label">{ gridPlan.planTitle }</span>
					{ showPlanSelect && (
						<span className="plan-comparison-grid__title-icon">
							<Icon icon={ chevronRightSmall } size={ 30 } />
						</span>
					) }
				</h4>
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
			</PlanSelector>
			<HeaderPrice
				planSlug={ planSlug }
				currentSitePlanSlug={ currentSitePlanSlug }
				visibleGridPlans={ visibleGridPlans }
			/>
			<div className="plan-comparison-grid__billing-info">
				<BillingTimeframe planSlug={ planSlug } showRefundPeriod={ showRefundPeriod } />
			</div>
			<ActionButton
				currentSitePlanSlug={ currentSitePlanSlug }
				availableForPurchase={ gridPlan.availableForPurchase }
				isInSignup={ isInSignup }
				planSlug={ planSlug }
				planActionOverrides={ planActionOverrides }
				showMonthlyPrice={ false }
				isStuck={ false }
				visibleGridPlans={ visibleGridPlans }
			/>
		</Cell>
	);
};

const PlanTypeSelectorWrapper = styled.div`
	display: none;
	${ plansGridMediumLarge( css`
		display: block;
	` ) }
`;

const ComparisonGridHeader = forwardRef< HTMLDivElement, ComparisonGridHeaderProps >(
	(
		{
			displayedGridPlans,
			visibleGridPlans,
			isInSignup,
			isFooter,
			onPlanChange,
			currentSitePlanSlug,
			planActionOverrides,
			selectedPlan,
			isHiddenInMobile,
			showRefundPeriod,
			isStuck,
			planTypeSelectorProps,
		},
		ref
	) => {
		const translate = useTranslate();
		const allVisible = visibleGridPlans.length === displayedGridPlans.length;
		const { coupon } = usePlansGridContext();

		return (
			<PlanRow isHiddenInMobile={ isHiddenInMobile } ref={ ref }>
				<RowTitleCell
					key="feature-name"
					className="plan-comparison-grid__header-cell is-placeholder-header-cell"
					isPlaceholderHeaderCell
				>
					{ isStuck && planTypeSelectorProps && (
						<PlanTypeSelectorWrapper>
							<PlanTypeSelector
								{ ...planTypeSelectorProps }
								title={ translate( 'Billing Cycle' ) }
								hideDiscount
								coupon={ coupon }
							/>
						</PlanTypeSelectorWrapper>
					) }
				</RowTitleCell>
				{ visibleGridPlans.map( ( { planSlug }, index ) => (
					<ComparisonGridHeaderCell
						planSlug={ planSlug }
						key={ planSlug }
						isLastInRow={ index === visibleGridPlans.length - 1 }
						isFooter={ isFooter }
						allVisible={ allVisible }
						isInSignup={ isInSignup }
						visibleGridPlans={ visibleGridPlans }
						onPlanChange={ onPlanChange }
						displayedGridPlans={ displayedGridPlans }
						currentSitePlanSlug={ currentSitePlanSlug }
						planActionOverrides={ planActionOverrides }
						selectedPlan={ selectedPlan }
						showRefundPeriod={ showRefundPeriod }
						isStuck={ isStuck }
					/>
				) ) }
			</PlanRow>
		);
	}
);

const ComparisonGridFeatureGroupRowCell: React.FunctionComponent< {
	feature?: FeatureObject;
	allJetpackFeatures: Set< string >;
	visibleGridPlans: GridPlan[];
	planSlug: PlanSlug;
	isStorageFeature: boolean;
	intervalType: string;
	setActiveTooltipId: Dispatch< SetStateAction< string > >;
	showUpgradeableStorage: boolean;
	activeTooltipId: string;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
} > = ( {
	feature,
	visibleGridPlans,
	planSlug,
	isStorageFeature,
	intervalType,
	activeTooltipId,
	setActiveTooltipId,
	showUpgradeableStorage,
	onStorageAddOnClick,
} ) => {
	const { gridPlansIndex, enableFeatureTooltips, hideUnsupportedFeatures } = usePlansGridContext();
	const gridPlan = gridPlansIndex[ planSlug ];
	const translate = useTranslate();
	const highlightAdjacencyMatrix = useHighlightAdjacencyMatrix( {
		renderedGridPlans: visibleGridPlans,
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

	const featureLabel = featureSlug
		? gridPlan?.features?.comparisonGridFeatureLabels?.[ featureSlug ]
		: undefined;

	const cellClasses = clsx(
		'plan-comparison-grid__feature-group-row-cell',
		'plan-comparison-grid__plan',
		getPlanClass( planSlug ),
		{
			'popular-plan-parent-class': gridPlan.highlightLabel,
			'has-feature': hasFeature,
			'has-feature-label': !! featureLabel,
			'hide-unsupported-feature': hideUnsupportedFeatures && ! hasFeature && ! featureLabel,
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
					<PlanStorage
						planSlug={ planSlug }
						onStorageAddOnClick={ onStorageAddOnClick }
						showUpgradeableStorage={ showUpgradeableStorage }
						priceOnSeparateLine
					/>
				</>
			) : (
				<>
					{ FEATURE_GROUP_PAYMENT_TRANSACTION_FEES === featureSlug ? (
						<>
							{ planPaymentTransactionFees ? (
								<>
									<Plans2023Tooltip
										text={ enableFeatureTooltips ? feature?.getDescription?.() : undefined }
										setActiveTooltipId={ setActiveTooltipId }
										activeTooltipId={ activeTooltipId }
										id={ `${ planSlug }-${ featureSlug }` }
									>
										<span className="plan-comparison-grid__plan-title">
											{ feature?.getAlternativeTitle?.() || feature?.getTitle() }
										</span>
									</Plans2023Tooltip>
									<span className="plan-comparison-grid__plan-conditional-title">
										{ planPaymentTransactionFees?.getAlternativeTitle?.() }
									</span>
								</>
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
							<Plans2023Tooltip
								text={ enableFeatureTooltips ? feature?.getDescription?.() : undefined }
								setActiveTooltipId={ setActiveTooltipId }
								activeTooltipId={ activeTooltipId }
								id={ `${ planSlug }-${ featureSlug }` }
							>
								<span className="plan-comparison-grid__plan-title">
									{ feature?.getAlternativeTitle?.() || feature?.getTitle() }
								</span>
							</Plans2023Tooltip>
							{ feature?.getCompareTitle && (
								<span className="plan-comparison-grid__plan-subtitle">
									{ feature.getCompareTitle() }
								</span>
							) }
							{ featureLabel && (
								<span className="plan-comparison-grid__plan-conditional-title">
									{ featureLabel }
								</span>
							) }
							{ hasFeature && feature?.getCompareSubtitle && (
								<span className="plan-comparison-grid__plan-subtitle">
									{ feature.getCompareSubtitle() }
								</span>
							) }
							{ hasFeature && ! featureLabel && <Gridicon icon="checkmark" color="#0675C4" /> }
							{ ! hasFeature && ! featureLabel && <Gridicon icon="minus-small" color="#C3C4C7" /> }
						</>
					) }
				</>
			) }
		</Cell>
	);
};

const ComparisonGridFeatureGroupRow: React.FunctionComponent< {
	feature?: FeatureObject | TransformedFeatureObject;
	isHiddenInMobile: boolean;
	allJetpackFeatures: Set< string >;
	visibleGridPlans: GridPlan[];
	planFeatureFootnotes: PlanFeatureFootnotes;
	isStorageFeature: boolean;
	isHighlighted: boolean;
	intervalType: string;
	setActiveTooltipId: Dispatch< SetStateAction< string > >;
	showUpgradeableStorage: boolean;
	activeTooltipId: string;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
} > = ( {
	feature,
	isHiddenInMobile,
	allJetpackFeatures,
	visibleGridPlans,
	planFeatureFootnotes,
	isStorageFeature,
	isHighlighted,
	intervalType,
	activeTooltipId,
	setActiveTooltipId,
	showUpgradeableStorage,
	onStorageAddOnClick,
} ) => {
	const translate = useTranslate();
	const rowClasses = clsx( 'plan-comparison-grid__feature-group-row', {
		'is-storage-feature': isStorageFeature,
	} );
	const featureSlug = feature?.getSlug() ?? '';
	const footnote = planFeatureFootnotes?.footnotesByFeature?.[ featureSlug ];
	const tooltipId = `${ feature?.getSlug() }-comparison-grid`;

	const { enableFeatureTooltips } = usePlansGridContext();

	return (
		<Row
			isHiddenInMobile={ isHiddenInMobile }
			className={ rowClasses }
			isHighlighted={ isHighlighted }
		>
			<RowTitleCell
				key="feature-name"
				className="is-feature-group-row-title-cell"
				isFeatureGroupRowTitleCell
			>
				{ isStorageFeature ? (
					<Plans2023Tooltip
						text={
							enableFeatureTooltips
								? translate( 'Space to store your photos, media, and more.' )
								: undefined
						}
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
						id={ tooltipId }
					>
						{ translate( 'Storage' ) }
					</Plans2023Tooltip>
				) : (
					<>
						{ feature && (
							<>
								<Plans2023Tooltip
									text={ enableFeatureTooltips ? feature.getDescription?.() : undefined }
									setActiveTooltipId={ setActiveTooltipId }
									activeTooltipId={ activeTooltipId }
									id={ tooltipId }
								>
									{ feature.getTitle() }
									{ footnote && (
										<FeatureFootnote>
											<sup>{ footnote }</sup>
										</FeatureFootnote>
									) }
								</Plans2023Tooltip>
								{ allJetpackFeatures.has( feature.getSlug() ) ? (
									<JetpackIconContainer>
										<Plans2023Tooltip
											text={ translate(
												'Security, performance, and growth tools—powered by Jetpack.'
											) }
											setActiveTooltipId={ setActiveTooltipId }
											activeTooltipId={ activeTooltipId }
											id={ `jp-${ tooltipId }` }
										>
											<JetpackLogo size={ 16 } />
										</Plans2023Tooltip>
									</JetpackIconContainer>
								) : null }
							</>
						) }
					</>
				) }
			</RowTitleCell>
			{ visibleGridPlans.map( ( { planSlug } ) => (
				<ComparisonGridFeatureGroupRowCell
					key={ planSlug }
					feature={ feature }
					allJetpackFeatures={ allJetpackFeatures }
					visibleGridPlans={ visibleGridPlans }
					planSlug={ planSlug }
					isStorageFeature={ isStorageFeature }
					intervalType={ intervalType }
					activeTooltipId={ activeTooltipId }
					setActiveTooltipId={ setActiveTooltipId }
					showUpgradeableStorage={ showUpgradeableStorage }
					onStorageAddOnClick={ onStorageAddOnClick }
				/>
			) ) }
		</Row>
	);
};

const FeatureGroup = ( {
	featureGroup,
	selectedFeature,
	intervalType,
	activeTooltipId,
	setActiveTooltipId,
	showUpgradeableStorage,
	onStorageAddOnClick,
	featureGroupMap,
	visibleGridPlans,
	planFeatureFootnotes,
}: {
	featureGroup: FeatureGroup;
	selectedFeature?: string;
	intervalType: string;
	activeTooltipId: string;
	setActiveTooltipId: Dispatch< SetStateAction< string > >;
	showUpgradeableStorage: boolean;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
	featureGroupMap: Partial< FeatureGroupMap >;
	visibleGridPlans: GridPlan[];
	planFeatureFootnotes: {
		footnoteList: string[];
		footnotesByFeature: Record< string, number >;
	};
} ) => {
	const { allFeaturesList } = usePlansGridContext();
	const [ firstSetOfFeatures ] = Object.keys( featureGroupMap );
	const [ visibleFeatureGroups, setVisibleFeatureGroups ] = useState< string[] >( [
		firstSetOfFeatures,
	] );
	const features = featureGroup.getFeatures();
	const featureObjects = filterUnusedFeaturesObject(
		visibleGridPlans,
		getPlanFeaturesObject( allFeaturesList, features )
	);
	const isHiddenInMobile = ! visibleFeatureGroups.includes( featureGroup.slug );

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

	const handleFeatureGroupToggle = useCallback( () => {
		const index = visibleFeatureGroups.indexOf( featureGroup.slug );
		const newVisibleFeatureGroups = [ ...visibleFeatureGroups ];

		if ( index === -1 ) {
			newVisibleFeatureGroups.push( featureGroup.slug );
		} else {
			newVisibleFeatureGroups.splice( index, 1 );
		}

		setVisibleFeatureGroups( newVisibleFeatureGroups );
	}, [ featureGroup, setVisibleFeatureGroups, visibleFeatureGroups ] );

	// Skip non Jetpack feature groups without any available features.
	if ( featureGroup.slug !== FEATURE_GROUP_ESSENTIAL_FEATURES && ! featureObjects.length ) {
		return null;
	}

	return (
		<div key={ featureGroup.slug } className="plan-comparison-grid__feature-group">
			<TitleRow
				className="plan-comparison-grid__feature-group-title-row"
				onClick={ handleFeatureGroupToggle }
			>
				<Title isHiddenInMobile={ isHiddenInMobile }>
					<Gridicon icon="chevron-up" size={ 12 } color="#1E1E1E" />
					<span>{ featureGroup.getTitle() }</span>
				</Title>
			</TitleRow>
			{ featureObjects.map( ( feature ) => (
				<ComparisonGridFeatureGroupRow
					key={ feature.getSlug() }
					feature={ feature }
					isHiddenInMobile={ isHiddenInMobile }
					allJetpackFeatures={ allJetpackFeatures }
					visibleGridPlans={ visibleGridPlans }
					planFeatureFootnotes={ planFeatureFootnotes }
					isStorageFeature={ false }
					isHighlighted={ feature.getSlug() === selectedFeature }
					intervalType={ intervalType }
					activeTooltipId={ activeTooltipId }
					setActiveTooltipId={ setActiveTooltipId }
					showUpgradeableStorage={ showUpgradeableStorage }
					onStorageAddOnClick={ onStorageAddOnClick }
				/>
			) ) }
			{ featureGroup.slug === FEATURE_GROUP_ESSENTIAL_FEATURES ? (
				<ComparisonGridFeatureGroupRow
					key="feature-storage"
					isHiddenInMobile={ isHiddenInMobile }
					allJetpackFeatures={ allJetpackFeatures }
					visibleGridPlans={ visibleGridPlans }
					planFeatureFootnotes={ planFeatureFootnotes }
					isStorageFeature
					isHighlighted={ false }
					intervalType={ intervalType }
					activeTooltipId={ activeTooltipId }
					setActiveTooltipId={ setActiveTooltipId }
					showUpgradeableStorage={ showUpgradeableStorage }
					onStorageAddOnClick={ onStorageAddOnClick }
				/>
			) : null }
		</div>
	);
};

const ComparisonGrid = ( {
	intervalType,
	isInSignup,
	currentSitePlanSlug,
	planActionOverrides,
	selectedPlan,
	selectedFeature,
	showUpgradeableStorage,
	stickyRowOffset,
	onStorageAddOnClick,
	showRefundPeriod,
	planTypeSelectorProps,
	gridSize,
}: ComparisonGridProps ) => {
	const { gridPlans, gridPlansIndex, featureGroupMap } = usePlansGridContext();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const [ visiblePlans, setVisiblePlans ] = useState< PlanSlug[] >( [] );

	const displayedGridPlans = useMemo( () => {
		return sortPlans( gridPlans, currentSitePlanSlug, 'small' === gridSize );
	}, [ gridPlans, currentSitePlanSlug, gridSize ] );

	useEffect( () => {
		setVisiblePlans( ( prev ) => {
			let visibleLength = displayedGridPlans.length;
			switch ( gridSize ) {
				case 'large':
					visibleLength = 4;
					break;
				case 'medium':
					visibleLength = 3;
					break;
				case 'smedium':
				case 'small':
					visibleLength = 2;
					break;
			}

			// visible length changed, update with the current gridPlans
			// - we don't care about previous order
			if ( prev.length !== visibleLength ) {
				return displayedGridPlans.slice( 0, visibleLength ).map( ( { planSlug } ) => planSlug );
			}

			// prev state out of sync with current gridPlans (e.g. gridPlans updated to a different term)
			// - we care about previous order
			const isPrevStale = prev.some( ( planSlug ) => ! gridPlansIndex[ planSlug ] );
			if ( isPrevStale ) {
				return prev.map( ( planSlug ) => {
					const gridPlan = displayedGridPlans.find(
						( gridPlan ) => getPlanClass( gridPlan.planSlug ) === getPlanClass( planSlug )
					);

					return gridPlan?.planSlug ?? planSlug;
				} );
			}

			// nothing to update
			return prev;
		} );
	}, [ gridSize, displayedGridPlans, gridPlansIndex ] );

	const visibleGridPlans = useMemo(
		() =>
			visiblePlans.reduce( ( acc, planSlug ) => {
				const gridPlan = displayedGridPlans.find(
					( gridPlan ) => getPlanClass( gridPlan.planSlug ) === getPlanClass( planSlug )
				);

				if ( gridPlan ) {
					acc.push( gridPlan );
				}

				return acc;
			}, [] as GridPlan[] ),
		[ visiblePlans, displayedGridPlans ]
	);

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

	// 100px is the padding of the footer row
	const [ bottomHeaderRef, isBottomHeaderInView ] = useInView( { rootMargin: '-100px' } );

	/**
	 * Search for "any" plan with a highlight label, not just the visible ones.
	 * This will keep the grid static while user interacts (selects different plans to compare).
	 * Some padding is applied in the stylesheet to cover the badges/labels.
	 */
	const hasHighlightedPlan = gridPlans.some( ( { highlightLabel } ) => !! highlightLabel );
	const classes = clsx( 'plans-grid-next-comparison-grid', {
		'has-highlighted-plan': hasHighlightedPlan,
	} );

	return (
		<div className={ classes }>
			<Grid visiblePlans={ visiblePlans.length }>
				<StickyContainer
					disabled={ isBottomHeaderInView }
					stickyClass="is-sticky-header-row"
					stickyOffset={ stickyRowOffset }
					zIndex={ 1 }
				>
					{ ( isStuck: boolean ) => (
						<ComparisonGridHeader
							displayedGridPlans={ displayedGridPlans }
							visibleGridPlans={ visibleGridPlans }
							isInSignup={ isInSignup }
							onPlanChange={ onPlanChange }
							currentSitePlanSlug={ currentSitePlanSlug }
							planActionOverrides={ planActionOverrides }
							selectedPlan={ selectedPlan }
							showRefundPeriod={ showRefundPeriod }
							isStuck={ isStuck }
							planTypeSelectorProps={ planTypeSelectorProps }
						/>
					) }
				</StickyContainer>
				{ Object.values( featureGroupMap ).map( ( featureGroup: FeatureGroup ) => (
					<FeatureGroup
						key={ featureGroup.slug }
						featureGroup={ featureGroup }
						visibleGridPlans={ visibleGridPlans }
						featureGroupMap={ featureGroupMap }
						selectedFeature={ selectedFeature }
						intervalType={ intervalType }
						activeTooltipId={ activeTooltipId }
						setActiveTooltipId={ setActiveTooltipId }
						showUpgradeableStorage={ showUpgradeableStorage }
						onStorageAddOnClick={ onStorageAddOnClick }
						planFeatureFootnotes={ planFeatureFootnotes }
					/>
				) ) }
				<ComparisonGridHeader
					displayedGridPlans={ displayedGridPlans }
					visibleGridPlans={ visibleGridPlans }
					isInSignup={ isInSignup }
					isFooter
					onPlanChange={ onPlanChange }
					currentSitePlanSlug={ currentSitePlanSlug }
					planActionOverrides={ planActionOverrides }
					selectedPlan={ selectedPlan }
					showRefundPeriod={ showRefundPeriod }
					isStuck={ false }
					isHiddenInMobile
					ref={ bottomHeaderRef }
					planTypeSelectorProps={ planTypeSelectorProps }
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

// TODO
// Now that everything under is functional component, we can deprecate this wrapper and only keep ComparisonGrid instead.
// More details can be found in https://github.com/Automattic/wp-calypso/issues/87047
const WrappedComparisonGrid = ( {
	siteId,
	intent,
	gridPlans,
	useCheckPlanAvailabilityForPurchase,
	useAction,
	recordTracksEvent,
	allFeaturesList,
	intervalType,
	isInSignup,
	currentSitePlanSlug,
	selectedPlan,
	selectedFeature,
	showUpgradeableStorage,
	onStorageAddOnClick,
	stickyRowOffset,
	coupon,
	className,
	hideUnsupportedFeatures,
	enableFeatureTooltips,
	featureGroupMap,
	...otherProps
}: ComparisonGridExternalProps ) => {
	const gridContainerRef = useRef< HTMLDivElement | null >( null );

	// TODO: this will be deprecated along side removing the wrapper component
	const gridSize = useGridSize( {
		containerRef: gridContainerRef,
		containerBreakpoints: new Map( [
			[ 'small', 0 ],
			[ 'smedium', 686 ],
			[ 'medium', 835 ], // enough to fit Enterpreneur plan. was 686
			[ 'large', 1005 ], // enough to fit Enterpreneur plan. was 870
			[ 'xlarge', 1180 ],
		] ),
	} );

	const classNames = clsx( 'plans-grid-next', className, {
		'is-small': 'small' === gridSize,
		'is-smedium': 'smedium' === gridSize,
		'is-medium': 'medium' === gridSize,
		'is-large': 'large' === gridSize,
		'is-xlarge': 'xlarge' === gridSize,
		'is-visible': true,
	} );

	return (
		<div ref={ gridContainerRef } className={ classNames }>
			<PlansGridContextProvider
				intent={ intent }
				siteId={ siteId }
				gridPlans={ gridPlans }
				useCheckPlanAvailabilityForPurchase={ useCheckPlanAvailabilityForPurchase }
				useAction={ useAction }
				recordTracksEvent={ recordTracksEvent }
				allFeaturesList={ allFeaturesList }
				coupon={ coupon }
				enableFeatureTooltips={ enableFeatureTooltips }
				featureGroupMap={ featureGroupMap }
				hideUnsupportedFeatures={ hideUnsupportedFeatures }
			>
				<ComparisonGrid
					intervalType={ intervalType }
					isInSignup={ isInSignup }
					currentSitePlanSlug={ currentSitePlanSlug }
					siteId={ siteId }
					selectedPlan={ selectedPlan }
					selectedFeature={ selectedFeature }
					showUpgradeableStorage={ showUpgradeableStorage }
					stickyRowOffset={ stickyRowOffset }
					onStorageAddOnClick={ onStorageAddOnClick }
					gridSize={ gridSize ?? undefined }
					{ ...otherProps }
				/>
			</PlansGridContextProvider>
		</div>
	);
};

export default WrappedComparisonGrid;
