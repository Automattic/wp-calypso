import { isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { useMemo } from 'react';
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
	featureGroup?: string | null;
};

const PlanFeaturesList = ( {
	generatedWPComSubdomain,
	hideUnavailableFeatures,
	isCustomDomainAllowedOnFreePlan,
	options,
	paidDomainName,
	renderedGridPlans,
	selectedFeature,
	featureGroup,
}: PlanFeaturesListProps ) => {
	const plansWithFeatures = useMemo( () => {
		return renderedGridPlans.filter(
			( gridPlan ) => ! isWpcomEnterpriseGridPlan( gridPlan.planSlug )
		);
	}, [ renderedGridPlans ] );

	return (
		<PlanFeaturesContainer
			featureGroup={ featureGroup }
			plansWithFeatures={ plansWithFeatures }
			paidDomainName={ paidDomainName }
			generatedWPComSubdomain={ generatedWPComSubdomain }
			hideUnavailableFeatures={ hideUnavailableFeatures }
			selectedFeature={ selectedFeature }
			isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
			isTableCell={ options?.isTableCell }
		/>
	);
};
export default PlanFeaturesList;
