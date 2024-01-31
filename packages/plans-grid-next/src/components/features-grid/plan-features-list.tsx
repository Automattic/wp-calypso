import { isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { DataResponse, GridPlan } from '../../types';
import PlanFeaturesContainer from '../plan-features-container';

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

const PlanFeaturesList = ( props: PlanFeaturesListProps ) => {
	const {
		generatedWPComSubdomain,
		hideUnavailableFeatures,
		isCustomDomainAllowedOnFreePlan,
		options,
		paidDomainName,
		renderedGridPlans,
		selectedFeature,
	} = props;
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
export default PlanFeaturesList;
