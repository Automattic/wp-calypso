import {
	FEATURE_CUSTOM_DOMAIN,
	getPlan,
	getPlanClass,
	isBusinessTrial,
	isWooExpressMediumPlan,
	isWooExpressPlan,
	isWooExpressSmallPlan,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
} from '@automattic/calypso-products';
import {
	BloombergLogo,
	CNNLogo,
	CondenastLogo,
	DisneyLogo,
	FacebookLogo,
	FoldableCard,
	SalesforceLogo,
	SlackLogo,
	TimeLogo,
} from '@automattic/components';
import classNames from 'classnames';
import { isStorageUpgradeableForPlan } from '../../lib/is-storage-upgradeable-for-plan';
import { getStorageStringFromFeature } from '../../util';
import PlanFeatures2023GridActions from '../actions';
import PlanFeatures2023GridHeaderPrice from '../header-price';
import { PlanFeaturesItem } from '../item';
import PlanDivOrTdContainer from '../plan-div-td-container';
import PlanFeaturesContainer from '../plan-features-container';
import PlanLogo from '../plan-logo';
import BillingTimeframe from '../shared/billing-timeframe';
import { StickyContainer } from '../sticky-container';
import StorageAddOnDropdown from '../storage-add-on-dropdown';
import type {
	BillingTimeframesProps,
	FeaturesGridProps,
	GridPlan,
	MobileFreeDomainProps,
	MobileViewProps,
	PlanFeaturesListProps,
	PlanHeadersProps,
	PlanLogosProps,
	PlanPriceProps,
	PlanStorageOptionsProps,
	PlanTaglineProps,
	PreviousFeaturesIncludedTitleProps,
	SpotlightPlanProps,
	TableProps,
	TabletViewProps,
	TopButtonsProps,
} from '../../types';

const PlanLogos = ( { gridPlans, isInSignup, options }: PlanLogosProps ) => {
	return gridPlans.map( ( { planSlug }, index ) => {
		return (
			<PlanLogo
				key={ planSlug }
				planSlug={ planSlug }
				planIndex={ index }
				renderedGridPlans={ gridPlans }
				isInSignup={ isInSignup }
				isTableCell={ options?.isTableCell }
			/>
		);
	} );
};

const PlanHeaders = ( { gridPlans, options }: PlanHeadersProps ) => {
	return gridPlans.map( ( { planSlug, planTitle } ) => {
		const headerClasses = classNames( 'plan-features-2023-grid__header', getPlanClass( planSlug ) );

		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				className="plan-features-2023-grid__table-item"
				isTableCell={ options?.isTableCell }
			>
				<header className={ headerClasses }>
					<h4 className="plan-features-2023-grid__header-title">{ planTitle }</h4>
				</header>
			</PlanDivOrTdContainer>
		);
	} );
};

const PlanTagline = ( { gridPlans, options }: PlanTaglineProps ) => {
	return gridPlans.map( ( { planSlug, tagline } ) => {
		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				className="plan-features-2023-grid__table-item"
				isTableCell={ options?.isTableCell }
			>
				<div className="plan-features-2023-grid__header-tagline">{ tagline }</div>
			</PlanDivOrTdContainer>
		);
	} );
};

const PlanPrice = ( {
	gridPlans,
	options,
	isLargeCurrency,
	planUpgradeCreditsApplicable,
	currentSitePlanSlug,
}: PlanPriceProps ) => {
	return gridPlans.map( ( { planSlug } ) => {
		return (
			<PlanDivOrTdContainer
				scope="col"
				key={ planSlug }
				className="plan-features-2023-grid__table-item plan-price"
				isTableCell={ options?.isTableCell }
			>
				<PlanFeatures2023GridHeaderPrice
					planSlug={ planSlug }
					planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
					isLargeCurrency={ isLargeCurrency }
					currentSitePlanSlug={ currentSitePlanSlug }
					visibleGridPlans={ gridPlans }
				/>
			</PlanDivOrTdContainer>
		);
	} );
};

const BillingTimeframes = ( { gridPlans, options, showRefundPeriod }: BillingTimeframesProps ) => {
	return gridPlans.map( ( { planSlug } ) => {
		const classes = classNames(
			'plan-features-2023-grid__table-item',
			'plan-features-2023-grid__header-billing-info'
		);

		return (
			<PlanDivOrTdContainer
				className={ classes }
				isTableCell={ options?.isTableCell }
				key={ planSlug }
			>
				<BillingTimeframe planSlug={ planSlug } showRefundPeriod={ showRefundPeriod } />
			</PlanDivOrTdContainer>
		);
	} );
};

const PlanStorageOptions = ( {
	gridPlans,
	options,
	translate,
	intervalType,
	onStorageAddOnClick,
	showUpgradeableStorage,
}: PlanStorageOptionsProps ) => {
	return gridPlans.map( ( { planSlug, features: { storageOptions } } ) => {
		if ( ! options?.isTableCell && isWpcomEnterpriseGridPlan( planSlug ) ) {
			return null;
		}

		const shouldRenderStorageTitle =
			storageOptions.length > 0 &&
			( storageOptions.length === 1 || intervalType !== 'yearly' || ! showUpgradeableStorage );
		const canUpgradeStorageForPlan = isStorageUpgradeableForPlan( {
			intervalType,
			showUpgradeableStorage,
			storageOptions,
		} );
		const storageJSX = canUpgradeStorageForPlan ? (
			<StorageAddOnDropdown
				label={ translate( 'Storage' ) }
				planSlug={ planSlug }
				onStorageAddOnClick={ onStorageAddOnClick }
				storageOptions={ storageOptions }
			/>
		) : (
			storageOptions.map( ( storageOption ) => {
				if ( ! storageOption?.isAddOn ) {
					return (
						<div className="plan-features-2023-grid__storage-buttons" key={ planSlug }>
							{ getStorageStringFromFeature( storageOption?.slug ) }
						</div>
					);
				}
			} )
		);

		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				className="plan-features-2023-grid__table-item plan-features-2023-grid__storage"
				isTableCell={ options?.isTableCell }
			>
				{ shouldRenderStorageTitle ? (
					<div className="plan-features-2023-grid__storage-title">{ translate( 'Storage' ) }</div>
				) : null }
				{ storageJSX }
			</PlanDivOrTdContainer>
		);
	} );
};

const TopButtons = ( {
	gridPlans,
	options,
	isInSignup,
	isLaunchPage,
	currentSitePlanSlug,
	translate,
	planActionOverrides,
	isLargeCurrency,
	onUpgradeClick,
}: TopButtonsProps ) => {
	return gridPlans.map(
		( { planSlug, availableForPurchase, isMonthlyPlan, features: { storageOptions } } ) => {
			const classes = classNames( 'plan-features-2023-grid__table-item', 'is-top-buttons' );

			// Leaving it `undefined` makes it use the default label
			let buttonText;

			if (
				isWooExpressMediumPlan( planSlug ) &&
				! isWooExpressMediumPlan( currentSitePlanSlug || '' )
			) {
				buttonText = translate( 'Get Performance', { textOnly: true } );
			} else if (
				isWooExpressSmallPlan( planSlug ) &&
				! isWooExpressSmallPlan( currentSitePlanSlug || '' )
			) {
				buttonText = translate( 'Get Essential', { textOnly: true } );
			} else if ( isBusinessTrial( currentSitePlanSlug || '' ) ) {
				buttonText = translate( 'Get %(plan)s', {
					textOnly: true,
					args: {
						plan: getPlan( planSlug )?.getTitle() || '',
					},
				} );
			}

			return (
				<PlanDivOrTdContainer
					key={ planSlug }
					className={ classes }
					isTableCell={ options?.isTableCell }
				>
					<PlanFeatures2023GridActions
						availableForPurchase={ availableForPurchase }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						isMonthlyPlan={ isMonthlyPlan }
						onUpgradeClick={ ( overridePlanSlug ) =>
							onUpgradeClick( overridePlanSlug ?? planSlug )
						}
						planSlug={ planSlug }
						currentSitePlanSlug={ currentSitePlanSlug }
						buttonText={ buttonText }
						planActionOverrides={ planActionOverrides }
						showMonthlyPrice={ true }
						isStuck={ options?.isStuck || false }
						isLargeCurrency={ isLargeCurrency }
						storageOptions={ storageOptions }
					/>
				</PlanDivOrTdContainer>
			);
		}
	);
};

const PreviousFeaturesIncludedTitle = ( {
	gridPlans,
	options,
	translate,
}: PreviousFeaturesIncludedTitleProps ) => {
	return gridPlans.map( ( { planSlug } ) => {
		const shouldRenderEnterpriseLogos = isWpcomEnterpriseGridPlan( planSlug );
		const shouldShowFeatureTitle = ! isWpComFreePlan( planSlug ) && ! shouldRenderEnterpriseLogos;
		const indexInGridPlansForFeaturesGrid = gridPlans.findIndex(
			( { planSlug: slug } ) => slug === planSlug
		);
		const previousProductName =
			indexInGridPlansForFeaturesGrid > 0
				? gridPlans[ indexInGridPlansForFeaturesGrid - 1 ].productNameShort
				: null;
		const title =
			previousProductName &&
			translate( 'Everything in %(planShortName)s, plus:', {
				args: { planShortName: previousProductName },
			} );
		const classes = classNames( 'plan-features-2023-grid__common-title', getPlanClass( planSlug ) );
		const rowspanProp = options?.isTableCell && shouldRenderEnterpriseLogos ? { rowSpan: '2' } : {};
		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				isTableCell={ options?.isTableCell }
				className="plan-features-2023-grid__table-item"
				{ ...rowspanProp }
			>
				{ shouldShowFeatureTitle && <div className={ classes }>{ title }</div> }
				{ shouldRenderEnterpriseLogos && (
					<div className="plan-features-2023-grid__item plan-features-2023-grid__enterprise-logo">
						<TimeLogo />
						<SlackLogo />
						<DisneyLogo />
						<CNNLogo />
						<SalesforceLogo />
						<FacebookLogo />
						<CondenastLogo />
						<BloombergLogo />
					</div>
				) }
			</PlanDivOrTdContainer>
		);
	} );
};

const PlanFeaturesList = ( {
	gridPlans,
	options,
	paidDomainName,
	translate,
	hideUnavailableFeatures,
	selectedFeature,
	generatedWPComSubdomain,
	isCustomDomainAllowedOnFreePlan,
}: PlanFeaturesListProps ) => {
	const plansWithFeatures = gridPlans.filter(
		( gridPlan ) => ! isWpcomEnterpriseGridPlan( gridPlan.planSlug )
	);

	return (
		<PlanFeaturesContainer
			plansWithFeatures={ plansWithFeatures }
			paidDomainName={ paidDomainName }
			generatedWPComSubdomain={ generatedWPComSubdomain }
			translate={ translate }
			hideUnavailableFeatures={ hideUnavailableFeatures }
			selectedFeature={ selectedFeature }
			isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
			isTableCell={ options?.isTableCell }
		/>
	);
};

const Table = ( {
	gridPlans,
	translate,
	gridPlanForSpotlight,
	stickyRowOffset,
	planUpgradeCreditsApplicable,
	currentSitePlanSlug,
	isInSignup,
	isLargeCurrency,
	isLaunchPage,
	planActionOverrides,
	onUpgradeClick,
	intervalType,
	onStorageAddOnClick,
	showUpgradeableStorage,
	paidDomainName,
	hideUnavailableFeatures,
	selectedFeature,
	generatedWPComSubdomain,
	isCustomDomainAllowedOnFreePlan,
}: TableProps ) => {
	// Do not render the spotlight plan if it exists
	const gridPlansWithoutSpotlight = ! gridPlanForSpotlight
		? gridPlans
		: gridPlans.filter( ( { planSlug } ) => gridPlanForSpotlight.planSlug !== planSlug );
	const tableClasses = classNames(
		'plan-features-2023-grid__table',
		`has-${ gridPlansWithoutSpotlight.length }-cols`
	);

	return (
		<table className={ tableClasses }>
			<caption className="plan-features-2023-grid__screen-reader-text screen-reader-text">
				{ translate( 'Available plans to choose from' ) }
			</caption>
			<tbody>
				<tr>
					<PlanLogos
						gridPlans={ gridPlansWithoutSpotlight }
						isInSignup={ isInSignup }
						options={ { isTableCell: true } }
					/>
				</tr>
				<tr>
					<PlanHeaders gridPlans={ gridPlansWithoutSpotlight } options={ { isTableCell: true } } />
				</tr>
				<tr>
					<PlanTagline gridPlans={ gridPlansWithoutSpotlight } options={ { isTableCell: true } } />
				</tr>
				<tr>
					<PlanPrice
						gridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
						isLargeCurrency={ isLargeCurrency }
						planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
						currentSitePlanSlug={ currentSitePlanSlug }
					/>
				</tr>
				<tr>
					<BillingTimeframes
						gridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
					/>
				</tr>
				<StickyContainer
					stickyClass="is-sticky-top-buttons-row"
					element="tr"
					stickyOffset={ stickyRowOffset }
					zIndex={ 2 }
				>
					{ ( isStuck: boolean ) => (
						<TopButtons
							gridPlans={ gridPlansWithoutSpotlight }
							options={ { isTableCell: true, isStuck } }
							isInSignup={ isInSignup }
							isLaunchPage={ isLaunchPage }
							currentSitePlanSlug={ currentSitePlanSlug }
							translate={ translate }
							planActionOverrides={ planActionOverrides }
							isLargeCurrency={ isLargeCurrency }
							onUpgradeClick={ onUpgradeClick }
						/>
					) }
				</StickyContainer>
				<tr>
					<PreviousFeaturesIncludedTitle
						gridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
						translate={ translate }
					/>
				</tr>
				<tr>
					<PlanFeaturesList
						gridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
						paidDomainName={ paidDomainName }
						translate={ translate }
						hideUnavailableFeatures={ hideUnavailableFeatures }
						selectedFeature={ selectedFeature }
						generatedWPComSubdomain={ generatedWPComSubdomain }
						isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
					/>
				</tr>
				<tr>
					<PlanStorageOptions
						gridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
						translate={ translate }
						intervalType={ intervalType }
						onStorageAddOnClick={ onStorageAddOnClick }
						showUpgradeableStorage={ showUpgradeableStorage }
					/>
				</tr>
			</tbody>
		</table>
	);
};

const SpotlightPlan = ( {
	gridPlanForSpotlight,
	isLargeCurrency,
	planUpgradeCreditsApplicable,
	currentSitePlanSlug,
	translate,
	intervalType,
	onStorageAddOnClick,
	showUpgradeableStorage,
	isInSignup,
	isLaunchPage,
	planActionOverrides,
	onUpgradeClick,
}: SpotlightPlanProps ) => {
	if ( ! gridPlanForSpotlight ) {
		return null;
	}

	const spotlightPlanClasses = classNames(
		'plan-features-2023-grid__plan-spotlight',
		getPlanClass( gridPlanForSpotlight.planSlug )
	);

	const isNotFreePlan = ! isFreePlan( gridPlanForSpotlight.planSlug );

	return (
		<div className={ spotlightPlanClasses }>
			<PlanLogos gridPlans={ [ gridPlanForSpotlight ] } isInSignup={ false } />
			<PlanHeaders gridPlans={ [ gridPlanForSpotlight ] } />
			{ isNotFreePlan && <PlanTagline gridPlans={ [ gridPlanForSpotlight ] } /> }
			{ isNotFreePlan && (
				<PlanPrice
					gridPlans={ [ gridPlanForSpotlight ] }
					isLargeCurrency={ isLargeCurrency }
					planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
					currentSitePlanSlug={ currentSitePlanSlug }
				/>
			) }
			{ isNotFreePlan && <BillingTimeframes gridPlans={ [ gridPlanForSpotlight ] } /> }
			<PlanStorageOptions
				gridPlans={ [ gridPlanForSpotlight ] }
				translate={ translate }
				intervalType={ intervalType }
				onStorageAddOnClick={ onStorageAddOnClick }
				showUpgradeableStorage={ showUpgradeableStorage }
			/>
			<TopButtons
				gridPlans={ [ gridPlanForSpotlight ] }
				isInSignup={ isInSignup }
				isLaunchPage={ isLaunchPage }
				currentSitePlanSlug={ currentSitePlanSlug }
				translate={ translate }
				planActionOverrides={ planActionOverrides }
				isLargeCurrency={ isLargeCurrency }
				onUpgradeClick={ onUpgradeClick }
			/>
		</div>
	);
};

const MobileFreeDomain = ( { gridPlan, translate, paidDomainName }: MobileFreeDomainProps ) => {
	const { planSlug, isMonthlyPlan } = gridPlan;

	if ( isMonthlyPlan || isWpComFreePlan( planSlug ) || isWpcomEnterpriseGridPlan( planSlug ) ) {
		return null;
	}

	// Remove the custom domain feature for Woo Express plans with introductory offer.
	if (
		isWooExpressPlan( planSlug ) &&
		! gridPlan.features.wpcomFeatures.some(
			( feature ) => feature.getSlug() === FEATURE_CUSTOM_DOMAIN
		)
	) {
		return null;
	}

	const displayText = paidDomainName
		? translate( '%(paidDomainName)s is included', {
				args: { paidDomainName },
		  } )
		: translate( 'Free domain for one year' );

	return (
		<div className="plan-features-2023-grid__highlighted-feature">
			<PlanFeaturesItem>
				<span className="plan-features-2023-grid__item-info is-annual-plan-feature is-available">
					<span className="plan-features-2023-grid__item-title is-bold">{ displayText }</span>
				</span>
			</PlanFeaturesItem>
		</div>
	);
};

const MobileView = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	gridPlans,
	hideUnavailableFeatures,
	intervalType,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	isLargeCurrency,
	isLaunchPage,
	onStorageAddOnClick,
	onUpgradeClick,
	paidDomainName,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	selectedFeature,
	showUpgradeableStorage,
	translate,
}: MobileViewProps ) => {
	const CardContainer = (
		props: React.ComponentProps< typeof FoldableCard > & { planSlug: string }
	) => {
		const { children, planSlug, ...otherProps } = props;
		return isWpcomEnterpriseGridPlan( planSlug ) ? (
			<div { ...otherProps }>{ children }</div>
		) : (
			<FoldableCard { ...otherProps } compact clickableHeader>
				{ children }
			</FoldableCard>
		);
	};

	return gridPlans
		.reduce( ( acc, griPlan ) => {
			// Bring the spotlight plan to the top
			if ( gridPlanForSpotlight?.planSlug === griPlan.planSlug ) {
				return [ griPlan ].concat( acc );
			}
			return acc.concat( griPlan );
		}, [] as GridPlan[] )
		.map( ( gridPlan, index ) => {
			const planCardClasses = classNames(
				'plan-features-2023-grid__mobile-plan-card',
				getPlanClass( gridPlan.planSlug )
			);

			const isNotFreePlan = ! isFreePlan( gridPlan.planSlug );

			const planCardJsx = (
				<div className={ planCardClasses } key={ `${ gridPlan.planSlug }-${ index }` }>
					<PlanLogos gridPlans={ [ gridPlan ] } isInSignup={ false } />
					<PlanHeaders gridPlans={ [ gridPlan ] } />
					{ isNotFreePlan && isInSignup && <PlanTagline gridPlans={ [ gridPlan ] } /> }
					{ isNotFreePlan && (
						<PlanPrice
							gridPlans={ [ gridPlan ] }
							isLargeCurrency={ isLargeCurrency }
							planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
							currentSitePlanSlug={ currentSitePlanSlug }
						/>
					) }
					{ isNotFreePlan && <BillingTimeframes gridPlans={ [ gridPlan ] } /> }
					<MobileFreeDomain
						gridPlan={ gridPlan }
						paidDomainName={ paidDomainName }
						translate={ translate }
					/>
					<PlanStorageOptions
						gridPlans={ [ gridPlan ] }
						translate={ translate }
						intervalType={ intervalType }
						onStorageAddOnClick={ onStorageAddOnClick }
						showUpgradeableStorage={ showUpgradeableStorage }
					/>
					<TopButtons
						gridPlans={ [ gridPlan ] }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						currentSitePlanSlug={ currentSitePlanSlug }
						translate={ translate }
						planActionOverrides={ planActionOverrides }
						isLargeCurrency={ isLargeCurrency }
						onUpgradeClick={ onUpgradeClick }
					/>
					<CardContainer
						header={ translate( 'Show all features' ) }
						planSlug={ gridPlan.planSlug }
						key={ `${ gridPlan.planSlug }-${ index }` }
						expanded={
							selectedFeature &&
							gridPlan.features.wpcomFeatures.some(
								( feature ) => feature.getSlug() === selectedFeature
							)
						}
					>
						<PreviousFeaturesIncludedTitle gridPlans={ [ gridPlan ] } translate={ translate } />
						<PlanFeaturesList
							gridPlans={ [ gridPlan ] }
							translate={ translate }
							selectedFeature={ selectedFeature }
							paidDomainName={ paidDomainName }
							hideUnavailableFeatures={ hideUnavailableFeatures }
							generatedWPComSubdomain={ generatedWPComSubdomain }
							isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						/>
					</CardContainer>
				</div>
			);
			return planCardJsx;
		} );
};

const TabletView = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	gridPlans,
	hideUnavailableFeatures,
	intervalType,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	isLargeCurrency,
	isLaunchPage,
	onStorageAddOnClick,
	onUpgradeClick,
	paidDomainName,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	selectedFeature,
	showUpgradeableStorage,
	stickyRowOffset,
	translate,
}: TabletViewProps ) => {
	const gridPlansWithoutSpotlight = ! gridPlanForSpotlight
		? gridPlans
		: gridPlans.filter( ( { planSlug } ) => gridPlanForSpotlight.planSlug !== planSlug );
	const numberOfPlansToShowOnTop = 4 === gridPlansWithoutSpotlight.length ? 2 : 3;
	const plansForTopRow = gridPlansWithoutSpotlight.slice( 0, numberOfPlansToShowOnTop );
	const plansForBottomRow = gridPlansWithoutSpotlight.slice( numberOfPlansToShowOnTop );
	const tableProps = {
		currentSitePlanSlug,
		generatedWPComSubdomain,
		gridPlanForSpotlight,
		hideUnavailableFeatures,
		intervalType,
		isCustomDomainAllowedOnFreePlan,
		isInSignup,
		isLargeCurrency,
		isLaunchPage,
		onStorageAddOnClick,
		onUpgradeClick,
		paidDomainName,
		planActionOverrides,
		planUpgradeCreditsApplicable,
		selectedFeature,
		showUpgradeableStorage,
		stickyRowOffset,
		translate,
	};

	return (
		<>
			<div className="plan-features-2023-grid__table-top">
				<Table gridPlans={ plansForTopRow } { ...tableProps } />
			</div>
			{ plansForBottomRow.length > 0 && (
				<div className="plan-features-2023-grid__table-bottom">
					<Table gridPlans={ plansForBottomRow } { ...tableProps } />
				</div>
			) }
		</>
	);
};

const FeaturesGrid = ( {
	gridPlans,
	translate,
	gridPlanForSpotlight,
	stickyRowOffset,
	isInSignup,
	isLargeCurrency,
	planUpgradeCreditsApplicable,
	currentSitePlanSlug,
	isLaunchPage,
	planActionOverrides,
	onUpgradeClick,
	intervalType,
	onStorageAddOnClick,
	showUpgradeableStorage,
	paidDomainName,
	hideUnavailableFeatures,
	selectedFeature,
	generatedWPComSubdomain,
	isCustomDomainAllowedOnFreePlan,
}: FeaturesGridProps ) => {
	const sharedProps = {
		currentSitePlanSlug,
		gridPlanForSpotlight,
		intervalType,
		isInSignup,
		isLargeCurrency,
		isLaunchPage,
		onStorageAddOnClick,
		onUpgradeClick,
		planActionOverrides,
		planUpgradeCreditsApplicable,
		selectedFeature,
		showUpgradeableStorage,
		translate,
	};

	const additionalProps = {
		generatedWPComSubdomain,
		gridPlans,
		hideUnavailableFeatures,
		isCustomDomainAllowedOnFreePlan,
		paidDomainName,
	};

	return (
		<>
			<SpotlightPlan { ...sharedProps } />
			<div className="plan-features">
				<div className="plan-features-2023-grid__content">
					<div>
						<div className="plan-features-2023-grid__desktop-view">
							<Table
								{ ...sharedProps }
								{ ...additionalProps }
								stickyRowOffset={ stickyRowOffset }
							/>
						</div>
						<div className="plan-features-2023-grid__tablet-view">
							<TabletView
								{ ...sharedProps }
								{ ...additionalProps }
								stickyRowOffset={ stickyRowOffset }
							/>
						</div>
						<div className="plan-features-2023-grid__mobile-view">
							<MobileView { ...sharedProps } { ...additionalProps } />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default FeaturesGrid;
