import {
	getPlanClass,
	isWooExpressPlan,
	FEATURE_GROUP_ESSENTIAL_FEATURES,
	getPlanFeaturesGrouped,
	getWooExpressFeaturesGrouped,
	FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	getPlans,
} from '@automattic/calypso-products';
import { Gridicon, JetpackLogo } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from '@wordpress/element';
import classNames from 'classnames';
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
import { useIsPlanUpgradeCreditVisible } from 'calypso/my-sites/plans-grid/hooks/use-is-plan-upgrade-credit-visible';
import { useManageTooltipToggle } from 'calypso/my-sites/plans-grid/hooks/use-manage-tooltip-toggle';
import getPlanFeaturesObject from 'calypso/my-sites/plans-grid/lib/get-plan-features-object';
import { usePlansGridContext } from '../../grid-context';
import useHighlightAdjacencyMatrix from '../../hooks/npm-ready/use-highlight-adjacency-matrix';
import useIsLargeCurrency from '../../hooks/npm-ready/use-is-large-currency';
import { usePlanPricingInfoFromGridPlans } from '../../hooks/use-plan-pricing-info-from-grid-plans';
import filterUnusedFeaturesObject from '../../lib/filter-unused-features-object';
import { isStorageUpgradeableForPlan } from '../../lib/is-storage-upgradeable-for-plan';
import { sortPlans } from '../../lib/sort-plan-properties';
import { plansBreakSmall } from '../../media-queries';
import { getStorageStringFromFeature, usePricingBreakpoint } from '../../util';
import PlanFeatures2023GridActions from '../actions';
import PlanFeatures2023GridBillingTimeframe from '../billing-timeframe';
import PlanFeatures2023GridHeaderPrice from '../header-price';
import PlanTypeSelector, { type PlanTypeSelectorProps } from '../plan-type-selector';
import { Plans2023Tooltip } from '../plans-2023-tooltip';
import PopularBadge from '../popular-badge';
import { StickyContainer } from '../sticky-container';
import StorageAddOnDropdown from '../storage-add-on-dropdown';
import type {
	GridPlan,
	TransformedFeatureObject,
} from '../../hooks/npm-ready/data-store/use-grid-plans';
import type { ComparisonGridProps, PlanActionOverrides } from '../../types';
import type {
	FeatureObject,
	Feature,
	FeatureGroup,
	PlanSlug,
	WPComStorageAddOnSlug,
	FeatureGroupMap,
} from '@automattic/calypso-products';

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

	${ plansBreakSmall( css`
		padding-inline-start: 0;
		border: none;
		padding: 0;
		max-width: 290px;

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

	${ plansBreakSmall( css`
		display: flex;
		align-items: center;
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
		display: ${ ( props ) => ( props.isHiddenInMobile ? 'none' : 'flex' ) };
	}

	${ plansBreakSmall( css`
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

		&.is-stuck {
			padding-bottom: 16px;
		}
	` ) }
`;

const RowTitleCell = styled.div`
	display: none;
	font-size: 14px;
	padding-right: 10px;
	${ plansBreakSmall( css`
		display: block;
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

type ComparisonGridHeaderProps = {
	displayedGridPlans: GridPlan[];
	visibleGridPlans: GridPlan[];
	isInSignup: boolean;
	isLaunchPage?: boolean | null;
	isFooter?: boolean;
	onPlanChange: ( currentPlan: PlanSlug, event: ChangeEvent< HTMLSelectElement > ) => void;
	currentSitePlanSlug?: string | null;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	siteId?: number | null;
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
	isLargeCurrency: boolean;
	isPlanUpgradeCreditEligible: boolean;
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
	isLaunchPage,
	isLargeCurrency,
	onUpgradeClick,
	planActionOverrides,
	isPlanUpgradeCreditEligible,
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

	const headerClasses = classNames( 'plan-comparison-grid__header-cell', getPlanClass( planSlug ), {
		'popular-plan-parent-class': gridPlan.highlightLabel,
		'is-last-in-row': isLastInRow,
		'plan-is-footer': isFooter,
		'is-left-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.leftOfHighlight,
		'is-right-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.rightOfHighlight,
		'is-only-highlight': highlightAdjacencyMatrix[ planSlug ]?.isOnlyHighlight,
		'is-current-plan': gridPlan.current,
		'is-stuck': isStuck,
	} );
	const popularBadgeClasses = classNames( {
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
				visibleGridPlans={ visibleGridPlans }
			/>
			<div className="plan-comparison-grid__billing-info">
				<PlanFeatures2023GridBillingTimeframe
					planSlug={ planSlug }
					showRefundPeriod={ showRefundPeriod }
				/>
			</div>
			<PlanFeatures2023GridActions
				currentSitePlanSlug={ currentSitePlanSlug }
				availableForPurchase={ gridPlan.availableForPurchase }
				isInSignup={ isInSignup }
				isLaunchPage={ isLaunchPage }
				planSlug={ planSlug }
				onUpgradeClick={ ( overridePlanSlug ) => onUpgradeClick( overridePlanSlug ?? planSlug ) }
				planActionOverrides={ planActionOverrides }
				showMonthlyPrice={ false }
				isStuck={ false }
			/>
		</Cell>
	);
};

const PlanTypeSelectorWrapper = styled.div`
	display: none;
	${ plansBreakSmall( css`
		display: block;
	` ) }
`;

const ComparisonGridHeader = forwardRef< HTMLDivElement, ComparisonGridHeaderProps >(
	(
		{
			displayedGridPlans,
			visibleGridPlans,
			isInSignup,
			isLaunchPage,
			isFooter,
			onPlanChange,
			currentSitePlanSlug,
			onUpgradeClick,
			siteId,
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
		const { prices, currencyCode } = usePlanPricingInfoFromGridPlans( {
			gridPlans: visibleGridPlans,
		} );

		const isLargeCurrency = useIsLargeCurrency( {
			prices,
			currencyCode: currencyCode || 'USD',
		} );
		const isPlanUpgradeCreditEligible = useIsPlanUpgradeCreditVisible(
			siteId ?? 0,
			displayedGridPlans.map( ( { planSlug } ) => planSlug )
		);

		return (
			<PlanRow isHiddenInMobile={ isHiddenInMobile } ref={ ref }>
				<RowTitleCell
					key="feature-name"
					className="plan-comparison-grid__header-cell is-placeholder-header-cell"
				>
					{ isStuck && planTypeSelectorProps && (
						<PlanTypeSelectorWrapper>
							<PlanTypeSelector
								{ ...planTypeSelectorProps }
								title={ translate( 'Billing Cycle' ) }
								hideDiscountLabel={ true }
							/>
						</PlanTypeSelectorWrapper>
					) }
				</RowTitleCell>
				{ visibleGridPlans.map( ( { planSlug }, index ) => (
					<ComparisonGridHeaderCell
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
						onUpgradeClick={ onUpgradeClick }
						isLaunchPage={ isLaunchPage }
						isLargeCurrency={ isLargeCurrency }
						planActionOverrides={ planActionOverrides }
						selectedPlan={ selectedPlan }
						siteId={ siteId }
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
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
} > = ( {
	feature,
	visibleGridPlans,
	planSlug,
	isStorageFeature,
	intervalType,
	activeTooltipId,
	showUpgradeableStorage,
	setActiveTooltipId,
	onStorageAddOnClick,
} ) => {
	const { gridPlansIndex } = usePlansGridContext();
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

	const hasConditionalFeature = featureSlug
		? gridPlan.features.conditionalFeatures?.some(
				( feature ) => feature.getSlug() === featureSlug
		  )
		: false;
	const storageOptions = gridPlan.features.storageOptions;
	const defaultStorageOption = storageOptions.find( ( option ) => ! option.isAddOn );
	const canUpgradeStorageForPlan = isStorageUpgradeableForPlan( {
		intervalType,
		showUpgradeableStorage,
		storageOptions,
	} );

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
					{ canUpgradeStorageForPlan ? (
						<StorageAddOnDropdown
							planSlug={ planSlug }
							storageOptions={ gridPlan.features.storageOptions }
							onStorageAddOnClick={ onStorageAddOnClick }
							priceOnSeparateLine
						/>
					) : (
						<StorageButton className="plan-features-2023-grid__storage-button" key={ planSlug }>
							{ getStorageStringFromFeature( defaultStorageOption?.slug || '' ) }
						</StorageButton>
					) }
				</>
			) : (
				<>
					{ FEATURE_GROUP_PAYMENT_TRANSACTION_FEES === featureSlug ? (
						<>
							{ planPaymentTransactionFees ? (
								<>
									<Plans2023Tooltip
										text={ feature?.getDescription?.() }
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
								text={ feature?.getDescription?.() }
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
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
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
	const rowClasses = classNames( 'plan-comparison-grid__feature-group-row', {
		'is-storage-feature': isStorageFeature,
	} );
	const featureSlug = feature?.getSlug() ?? '';
	const footnote = planFeatureFootnotes?.footnotesByFeature?.[ featureSlug ];
	const tooltipId = `${ feature?.getSlug() }-comparison-grid`;

	return (
		<Row
			isHiddenInMobile={ isHiddenInMobile }
			className={ rowClasses }
			isHighlighted={ isHighlighted }
		>
			<RowTitleCell key="feature-name" className="is-feature-group-row-title-cell">
				{ isStorageFeature ? (
					<Plans2023Tooltip
						text={ translate( 'Space to store your photos, media, and more.' ) }
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
									text={ feature.getDescription?.() }
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
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
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
	const features = featureGroup.get2023PricingGridSignupWpcomFeatures();
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
					isStorageFeature={ true }
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
	isLaunchPage,
	currentSitePlanSlug,
	onUpgradeClick,
	siteId,
	planActionOverrides,
	selectedPlan,
	selectedFeature,
	showUpgradeableStorage,
	stickyRowOffset,
	onStorageAddOnClick,
	showRefundPeriod,
	planTypeSelectorProps,
}: ComparisonGridProps ) => {
	const { gridPlans } = usePlansGridContext();
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();

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

	const displayedGridPlans = useMemo( () => {
		return sortPlans( gridPlans, currentSitePlanSlug, isMediumBreakpoint );
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

	return (
		<div className="plan-comparison-grid">
			<Grid isInSignup={ isInSignup }>
				<StickyContainer
					disabled={ isBottomHeaderInView }
					stickyClass="is-sticky-header-row"
					stickyOffset={ stickyRowOffset }
				>
					{ ( isStuck: boolean ) => (
						<ComparisonGridHeader
							siteId={ siteId }
							displayedGridPlans={ displayedGridPlans }
							visibleGridPlans={ visibleGridPlans }
							isInSignup={ isInSignup }
							isLaunchPage={ isLaunchPage }
							onPlanChange={ onPlanChange }
							currentSitePlanSlug={ currentSitePlanSlug }
							onUpgradeClick={ onUpgradeClick }
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
					isLaunchPage={ isLaunchPage }
					isFooter={ true }
					onPlanChange={ onPlanChange }
					currentSitePlanSlug={ currentSitePlanSlug }
					onUpgradeClick={ onUpgradeClick }
					siteId={ siteId }
					planActionOverrides={ planActionOverrides }
					selectedPlan={ selectedPlan }
					showRefundPeriod={ showRefundPeriod }
					isStuck={ false }
					isHiddenInMobile={ true }
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

export default ComparisonGrid;
