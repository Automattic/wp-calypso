import { AddOns } from '@automattic/data-stores';
import { useMemo } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../grid-context';
import { DataResponse, GridPlan, PlanActionOverrides } from '../../types';
import { StickyContainer } from '../sticky-container';
import BillingTimeframes from './billing-timeframes';
import EnterpriseFeatures from './enterprise-features';
import PlanFeaturesList from './plan-features-list';
import PlanHeaders from './plan-headers';
import PlanLogos from './plan-logos';
import PlanPrice from './plan-price';
import PlanTagline from './plan-tagline';
import PreviousFeaturesIncludedTitle from './previous-features-included-title';
import TopButtons from './top-buttons';
import type { FeatureGroupSlug } from '@automattic/calypso-products';

type TableProps = {
	currentSitePlanSlug?: string | null;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	gridPlanForSpotlight?: GridPlan;
	hideUnavailableFeatures?: boolean;
	isCustomDomainAllowedOnFreePlan: boolean;
	isInSignup: boolean;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
	paidDomainName?: string;
	planActionOverrides?: PlanActionOverrides;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	showRefundPeriod?: boolean;
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
	isCustomDomainAllowedOnFreePlan,
	isInSignup,
	onStorageAddOnClick,
	paidDomainName,
	planActionOverrides,
	renderedGridPlans,
	selectedFeature,
	showRefundPeriod,
	showUpgradeableStorage,
	stickyRowOffset,
}: TableProps ) => {
	const translate = useTranslate();
	const { enableCategorisedFeatures, featureGroupMap } = usePlansGridContext();
	const featureGroups = useMemo(
		() => Object.keys( featureGroupMap ) as FeatureGroupSlug[],
		[ featureGroupMap ]
	);
	// Do not render the spotlight plan if it exists
	const gridPlansWithoutSpotlight = useMemo(
		() =>
			! gridPlanForSpotlight
				? renderedGridPlans
				: renderedGridPlans.filter(
						( { planSlug } ) => gridPlanForSpotlight.planSlug !== planSlug
				  ),
		[ renderedGridPlans, gridPlanForSpotlight ]
	);
	// Search for a plan with a highlight label. Some margin is applied in the stylesheet to cover the badges/labels
	const hasHighlightedPlan = gridPlansWithoutSpotlight.some(
		( { highlightLabel } ) => !! highlightLabel
	);
	const tableClasses = clsx(
		'plan-features-2023-grid__table',
		`has-${ gridPlansWithoutSpotlight.length }-cols`,
		{
			'has-highlighted-plan': hasHighlightedPlan,
		}
	);

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
					<PlanPrice
						renderedGridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
						currentSitePlanSlug={ currentSitePlanSlug }
					/>
				</tr>
				<tr>
					<BillingTimeframes
						renderedGridPlans={ gridPlansWithoutSpotlight }
						showRefundPeriod={ showRefundPeriod }
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
							currentSitePlanSlug={ currentSitePlanSlug }
							planActionOverrides={ planActionOverrides }
						/>
					) }
				</StickyContainer>
				<tr>
					<EnterpriseFeatures
						renderedGridPlans={ gridPlansWithoutSpotlight }
						options={ { isTableCell: true } }
					/>
				</tr>
				{ ! enableCategorisedFeatures && (
					<tr>
						<PreviousFeaturesIncludedTitle
							renderedGridPlans={ gridPlansWithoutSpotlight }
							options={ { isTableCell: true } }
						/>
					</tr>
				) }
				{ featureGroups.map( ( featureGroupSlug, featureGroupIndex ) => (
					<tr
						className={ clsx( 'plans-grid-next-features-grid__feature-group-row', {
							'is-first-feature-group-row': featureGroupIndex === 0,
						} ) }
						key={ featureGroupSlug }
					>
						<PlanFeaturesList
							renderedGridPlans={ gridPlansWithoutSpotlight }
							options={ { isTableCell: true } }
							paidDomainName={ paidDomainName }
							hideUnavailableFeatures={ hideUnavailableFeatures }
							selectedFeature={ selectedFeature }
							generatedWPComSubdomain={ generatedWPComSubdomain }
							isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
							featureGroupSlug={ featureGroupSlug }
							onStorageAddOnClick={ onStorageAddOnClick }
							showUpgradeableStorage={ showUpgradeableStorage }
						/>
					</tr>
				) ) }
			</tbody>
		</table>
	);
};

export default Table;
