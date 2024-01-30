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
	WPComStorageAddOnSlug,
	PlanSlug,
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
import { useTranslate } from 'i18n-calypso';
import useIsLargeCurrency from '../../hooks/use-is-large-currency';
import { usePlanPricingInfoFromGridPlans } from '../../hooks/use-plan-pricing-info-from-grid-plans';
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
import type { DataResponse, FeaturesGridProps, GridPlan, PlanActionOverrides } from '../../types';

type PlanLogosProps = {
	isInSignup: boolean;
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PlanLogos = ( { isInSignup, options, renderedGridPlans }: PlanLogosProps ) => {
	return renderedGridPlans.map( ( { planSlug }, index ) => {
		return (
			<PlanLogo
				key={ planSlug }
				planSlug={ planSlug }
				planIndex={ index }
				renderedGridPlans={ renderedGridPlans }
				isInSignup={ isInSignup }
				isTableCell={ options?.isTableCell }
			/>
		);
	} );
};

type PlanHeadersProps = {
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PlanHeaders = ( { options, renderedGridPlans }: PlanHeadersProps ) => {
	return renderedGridPlans.map( ( { planSlug, planTitle } ) => {
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

type PlanTaglineProps = {
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PlanTagline = ( { options, renderedGridPlans }: PlanTaglineProps ) => {
	return renderedGridPlans.map( ( { planSlug, tagline } ) => {
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

type FeaturesGridPlanPriceProps = {
	currentSitePlanSlug?: string | null;
	planUpgradeCreditsApplicable?: number | null;
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const FeaturesGridPlanPrice = ( {
	currentSitePlanSlug,
	options,
	planUpgradeCreditsApplicable,
	renderedGridPlans,
}: FeaturesGridPlanPriceProps ) => {
	const { prices, currencyCode } = usePlanPricingInfoFromGridPlans( {
		gridPlans: renderedGridPlans,
	} );
	const isLargeCurrency = useIsLargeCurrency( { prices, currencyCode: currencyCode || 'USD' } );

	return renderedGridPlans.map( ( { planSlug } ) => {
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
					visibleGridPlans={ renderedGridPlans }
				/>
			</PlanDivOrTdContainer>
		);
	} );
};

type BillingTimeframesProps = {
	renderedGridPlans: GridPlan[];
	showRefundPeriod?: boolean;
	options?: {
		isTableCell?: boolean;
	};
};

const BillingTimeframes = ( {
	options,
	renderedGridPlans,
	showRefundPeriod,
}: BillingTimeframesProps ) => {
	return renderedGridPlans.map( ( { planSlug } ) => {
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

type PlanStorageOptionsProps = {
	intervalType: string;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	renderedGridPlans: GridPlan[];
	showUpgradeableStorage: boolean;
	options?: {
		isTableCell?: boolean;
	};
};

const PlanStorageOptions = ( {
	intervalType,
	onStorageAddOnClick,
	options,
	renderedGridPlans,
	showUpgradeableStorage,
}: PlanStorageOptionsProps ) => {
	const translate = useTranslate();

	return renderedGridPlans.map( ( { planSlug, features: { storageOptions } } ) => {
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

type TopButtonsProps = {
	currentSitePlanSlug?: string | null;
	isInSignup: boolean;
	isLaunchPage?: boolean | null;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	planActionOverrides?: PlanActionOverrides;
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
		isStuck?: boolean;
	};
};

const TopButtons = ( {
	currentSitePlanSlug,
	isInSignup,
	isLaunchPage,
	onUpgradeClick,
	options,
	planActionOverrides,
	renderedGridPlans,
}: TopButtonsProps ) => {
	const translate = useTranslate();
	const { prices, currencyCode } = usePlanPricingInfoFromGridPlans( {
		gridPlans: renderedGridPlans,
	} );
	const isLargeCurrency = useIsLargeCurrency( { prices, currencyCode: currencyCode || 'USD' } );

	return renderedGridPlans.map(
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

type PreviousFeaturesIncludedTitleProps = {
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PreviousFeaturesIncludedTitle = ( {
	renderedGridPlans,
	options,
}: PreviousFeaturesIncludedTitleProps ) => {
	const translate = useTranslate();

	return renderedGridPlans.map( ( { planSlug } ) => {
		const shouldRenderEnterpriseLogos = isWpcomEnterpriseGridPlan( planSlug );
		const shouldShowFeatureTitle = ! isWpComFreePlan( planSlug ) && ! shouldRenderEnterpriseLogos;
		const indexInGridPlansForFeaturesGrid = renderedGridPlans.findIndex(
			( { planSlug: slug } ) => slug === planSlug
		);
		const previousProductName =
			indexInGridPlansForFeaturesGrid > 0
				? renderedGridPlans[ indexInGridPlansForFeaturesGrid - 1 ].productNameShort
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

type PlanFeaturesListProps = {
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	hideUnavailableFeatures?: boolean;
	isCustomDomainAllowedOnFreePlan: boolean;
	paidDomainName?: string;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	options?: {
		isTableCell?: boolean;
	};
};

const PlanFeaturesList = ( {
	generatedWPComSubdomain,
	hideUnavailableFeatures,
	isCustomDomainAllowedOnFreePlan,
	options,
	paidDomainName,
	renderedGridPlans,
	selectedFeature,
}: PlanFeaturesListProps ) => {
	const translate = useTranslate();
	const plansWithFeatures = renderedGridPlans.filter(
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

type TableProps = {
	currentSitePlanSlug?: string | null;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	gridPlanForSpotlight?: GridPlan;
	hideUnavailableFeatures?: boolean;
	intervalType: string;
	isCustomDomainAllowedOnFreePlan: boolean;
	isInSignup: boolean;
	isLaunchPage?: boolean | null;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	paidDomainName?: string;
	planActionOverrides?: PlanActionOverrides;
	planUpgradeCreditsApplicable?: number | null;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	showUpgradeableStorage: boolean;
	stickyRowOffset: number;
	options?: {
		isTableCell?: boolean;
	};
};

const Table = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	hideUnavailableFeatures,
	intervalType,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	isLaunchPage,
	onStorageAddOnClick,
	onUpgradeClick,
	paidDomainName,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	renderedGridPlans,
	selectedFeature,
	showUpgradeableStorage,
	stickyRowOffset,
}: TableProps ) => {
	// Do not render the spotlight plan if it exists
	const gridPlansWithoutSpotlight = ! gridPlanForSpotlight
		? renderedGridPlans
		: renderedGridPlans.filter( ( { planSlug } ) => gridPlanForSpotlight.planSlug !== planSlug );
	const tableClasses = classNames(
		'plan-features-2023-grid__table',
		`has-${ gridPlansWithoutSpotlight.length }-cols`
	);
	const translate = useTranslate();

	return (
		<table className={ tableClasses }>
			<caption className="plan-features-2023-grid__screen-reader-text screen-reader-text">
				{ translate( 'Available plans to choose from' ) }
			</caption>
			<tbody>
				<tr>
					<PlanLogos
						renderedGridPlans={ gridPlansWithoutSpotlight }
						isInSignup={ isInSignup }
						options={ { isTableCell: true } }
					/>
				</tr>
				<tr>
					<PlanHeaders
						renderedGridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
					/>
				</tr>
				<tr>
					<PlanTagline
						renderedGridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
					/>
				</tr>
				<tr>
					<FeaturesGridPlanPrice
						renderedGridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
						planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
						currentSitePlanSlug={ currentSitePlanSlug }
					/>
				</tr>
				<tr>
					<BillingTimeframes
						renderedGridPlans={ gridPlansWithoutSpotlight }
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
							renderedGridPlans={ gridPlansWithoutSpotlight }
							options={ { isTableCell: true, isStuck } }
							isInSignup={ isInSignup }
							isLaunchPage={ isLaunchPage }
							currentSitePlanSlug={ currentSitePlanSlug }
							planActionOverrides={ planActionOverrides }
							onUpgradeClick={ onUpgradeClick }
						/>
					) }
				</StickyContainer>
				<tr>
					<PreviousFeaturesIncludedTitle
						renderedGridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
					/>
				</tr>
				<tr>
					<PlanFeaturesList
						renderedGridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
						paidDomainName={ paidDomainName }
						hideUnavailableFeatures={ hideUnavailableFeatures }
						selectedFeature={ selectedFeature }
						generatedWPComSubdomain={ generatedWPComSubdomain }
						isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
					/>
				</tr>
				<tr>
					<PlanStorageOptions
						renderedGridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
						intervalType={ intervalType }
						onStorageAddOnClick={ onStorageAddOnClick }
						showUpgradeableStorage={ showUpgradeableStorage }
					/>
				</tr>
			</tbody>
		</table>
	);
};

type SpotlightPlanProps = {
	currentSitePlanSlug?: string | null;
	gridPlanForSpotlight?: GridPlan;
	intervalType: string;
	isInSignup: boolean;
	isLaunchPage?: boolean | null;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	planActionOverrides?: PlanActionOverrides;
	planUpgradeCreditsApplicable?: number | null;
	showUpgradeableStorage: boolean;
	options?: {
		isTableCell?: boolean;
	};
};

const SpotlightPlan = ( {
	currentSitePlanSlug,
	gridPlanForSpotlight,
	intervalType,
	isInSignup,
	isLaunchPage,
	onStorageAddOnClick,
	onUpgradeClick,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	showUpgradeableStorage,
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
			<PlanLogos renderedGridPlans={ [ gridPlanForSpotlight ] } isInSignup={ false } />
			<PlanHeaders renderedGridPlans={ [ gridPlanForSpotlight ] } />
			{ isNotFreePlan && <PlanTagline renderedGridPlans={ [ gridPlanForSpotlight ] } /> }
			{ isNotFreePlan && (
				<FeaturesGridPlanPrice
					renderedGridPlans={ [ gridPlanForSpotlight ] }
					planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
					currentSitePlanSlug={ currentSitePlanSlug }
				/>
			) }
			{ isNotFreePlan && <BillingTimeframes renderedGridPlans={ [ gridPlanForSpotlight ] } /> }
			<PlanStorageOptions
				renderedGridPlans={ [ gridPlanForSpotlight ] }
				intervalType={ intervalType }
				onStorageAddOnClick={ onStorageAddOnClick }
				showUpgradeableStorage={ showUpgradeableStorage }
			/>
			<TopButtons
				renderedGridPlans={ [ gridPlanForSpotlight ] }
				isInSignup={ isInSignup }
				isLaunchPage={ isLaunchPage }
				currentSitePlanSlug={ currentSitePlanSlug }
				planActionOverrides={ planActionOverrides }
				onUpgradeClick={ onUpgradeClick }
			/>
		</div>
	);
};

type MobileFreeDomainProps = {
	gridPlan: GridPlan;
	paidDomainName?: string;
};

const MobileFreeDomain = ( { gridPlan, paidDomainName }: MobileFreeDomainProps ) => {
	const { planSlug, isMonthlyPlan } = gridPlan;
	const translate = useTranslate();

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

type MobileViewProps = {
	currentSitePlanSlug?: string | null;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	gridPlanForSpotlight?: GridPlan;
	hideUnavailableFeatures?: boolean;
	intervalType: string;
	isCustomDomainAllowedOnFreePlan: boolean;
	isInSignup: boolean;
	isLaunchPage?: boolean | null;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	paidDomainName?: string;
	planActionOverrides?: PlanActionOverrides;
	planUpgradeCreditsApplicable?: number | null;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	showUpgradeableStorage: boolean;
};

const MobileView = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	renderedGridPlans,
	hideUnavailableFeatures,
	intervalType,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	isLaunchPage,
	onStorageAddOnClick,
	onUpgradeClick,
	paidDomainName,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	selectedFeature,
	showUpgradeableStorage,
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
	const translate = useTranslate();

	return renderedGridPlans
		.reduce( ( acc, gridPlan ) => {
			// Bring the spotlight plan to the top
			if ( gridPlanForSpotlight?.planSlug === gridPlan.planSlug ) {
				return [ gridPlan ].concat( acc );
			}
			return acc.concat( gridPlan );
		}, [] as GridPlan[] )
		.map( ( gridPlan, index ) => {
			const planCardClasses = classNames(
				'plan-features-2023-grid__mobile-plan-card',
				getPlanClass( gridPlan.planSlug )
			);

			const isNotFreePlan = ! isFreePlan( gridPlan.planSlug );

			const planCardJsx = (
				<div className={ planCardClasses } key={ `${ gridPlan.planSlug }-${ index }` }>
					<PlanLogos renderedGridPlans={ [ gridPlan ] } isInSignup={ false } />
					<PlanHeaders renderedGridPlans={ [ gridPlan ] } />
					{ isNotFreePlan && isInSignup && <PlanTagline renderedGridPlans={ [ gridPlan ] } /> }
					{ isNotFreePlan && (
						<FeaturesGridPlanPrice
							renderedGridPlans={ [ gridPlan ] }
							planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
							currentSitePlanSlug={ currentSitePlanSlug }
						/>
					) }
					{ isNotFreePlan && <BillingTimeframes renderedGridPlans={ [ gridPlan ] } /> }
					<MobileFreeDomain gridPlan={ gridPlan } paidDomainName={ paidDomainName } />
					<PlanStorageOptions
						renderedGridPlans={ [ gridPlan ] }
						intervalType={ intervalType }
						onStorageAddOnClick={ onStorageAddOnClick }
						showUpgradeableStorage={ showUpgradeableStorage }
					/>
					<TopButtons
						renderedGridPlans={ [ gridPlan ] }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						currentSitePlanSlug={ currentSitePlanSlug }
						planActionOverrides={ planActionOverrides }
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
						<PreviousFeaturesIncludedTitle renderedGridPlans={ [ gridPlan ] } />
						<PlanFeaturesList
							renderedGridPlans={ [ gridPlan ] }
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

type TabletViewProps = {
	currentSitePlanSlug?: string | null;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	gridPlanForSpotlight?: GridPlan;
	hideUnavailableFeatures?: boolean;
	intervalType: string;
	isCustomDomainAllowedOnFreePlan: boolean;
	isInSignup: boolean;
	isLaunchPage?: boolean | null;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	paidDomainName?: string;
	planActionOverrides?: PlanActionOverrides;
	planUpgradeCreditsApplicable?: number | null;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	showUpgradeableStorage: boolean;
	stickyRowOffset: number;
};

const TabletView = ( {
	currentSitePlanSlug,
	generatedWPComSubdomain,
	gridPlanForSpotlight,
	renderedGridPlans,
	hideUnavailableFeatures,
	intervalType,
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	isLaunchPage,
	onStorageAddOnClick,
	onUpgradeClick,
	paidDomainName,
	planActionOverrides,
	planUpgradeCreditsApplicable,
	selectedFeature,
	showUpgradeableStorage,
	stickyRowOffset,
}: TabletViewProps ) => {
	const gridPlansWithoutSpotlight = ! gridPlanForSpotlight
		? renderedGridPlans
		: renderedGridPlans.filter( ( { planSlug } ) => gridPlanForSpotlight.planSlug !== planSlug );
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
		isLaunchPage,
		onStorageAddOnClick,
		onUpgradeClick,
		paidDomainName,
		planActionOverrides,
		planUpgradeCreditsApplicable,
		selectedFeature,
		showUpgradeableStorage,
		stickyRowOffset,
	};

	return (
		<>
			<div className="plan-features-2023-grid__table-top">
				<Table renderedGridPlans={ plansForTopRow } { ...tableProps } />
			</div>
			{ plansForBottomRow.length > 0 && (
				<div className="plan-features-2023-grid__table-bottom">
					<Table renderedGridPlans={ plansForBottomRow } { ...tableProps } />
				</div>
			) }
		</>
	);
};

const FeaturesGrid = ( {
	gridPlans,
	gridPlanForSpotlight,
	stickyRowOffset,
	isInSignup,
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
	const spotlightPlanProps = {
		currentSitePlanSlug,
		gridPlanForSpotlight,
		intervalType,
		isInSignup,
		isLaunchPage,
		onStorageAddOnClick,
		onUpgradeClick,
		planActionOverrides,
		planUpgradeCreditsApplicable,
		selectedFeature,
		showUpgradeableStorage,
	};

	const planFeaturesProps = {
		...spotlightPlanProps,
		generatedWPComSubdomain,
		renderedGridPlans: gridPlans,
		hideUnavailableFeatures,
		isCustomDomainAllowedOnFreePlan,
		paidDomainName,
	};

	return (
		<>
			<SpotlightPlan { ...spotlightPlanProps } />
			<div className="plan-features">
				<div className="plan-features-2023-grid__content">
					<div>
						<div className="plan-features-2023-grid__desktop-view">
							<Table { ...planFeaturesProps } stickyRowOffset={ stickyRowOffset } />
						</div>
						<div className="plan-features-2023-grid__tablet-view">
							<TabletView { ...planFeaturesProps } stickyRowOffset={ stickyRowOffset } />
						</div>
						<div className="plan-features-2023-grid__mobile-view">
							<MobileView { ...planFeaturesProps } />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default FeaturesGrid;
