import { PlanSlug, WPComStorageAddOnSlug } from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { DataResponse, GridPlan, PlanActionOverrides } from '../../types';
import { StickyContainer } from '../sticky-container';
import BillingTimeframes from './billing-timeframes';
import PlanFeaturesList from './plan-features-list';
import PlanHeaders from './plan-headers';
import PlanLogos from './plan-logos';
import PlanPrice from './plan-price';
import PlanStorageOptions from './plan-storage-options';
import PlanTagline from './plan-tagline';
import PreviousFeaturesIncludedTitle from './previous-features-included-title';
import TopButtons from './top-buttons';

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
	/**
	 * Search for a plan with a highlight label.
	 * Some margin is applied in the stylesheet to cover the badges/labels.
	 */
	const hasHighlightedPlan = gridPlansWithoutSpotlight.some(
		( { highlightLabel } ) => !! highlightLabel
	);
	const tableClasses = classNames(
		'plan-features-2023-grid__table',
		`has-${ gridPlansWithoutSpotlight.length }-cols`,
		{
			'has-highlighted-plan': hasHighlightedPlan,
		}
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
					<PlanPrice
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

export default Table;
