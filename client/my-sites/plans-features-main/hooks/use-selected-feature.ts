import { GridPlan } from '@automattic/plans-grid-next';
import { useMemo } from '@wordpress/element';

interface Params {
	gridPlans: GridPlan[] | null;
	selectedFeature?: string;
	selectedPlan?: string;
}

export type SelectedFeatureData = {
	slug: string;
	title: string;
	description: string;
};

const useSelectedFeature = ( {
	selectedFeature,
	selectedPlan,
	gridPlans,
}: Params ): SelectedFeatureData | null => {
	const selectedFeatureData = useMemo( () => {
		if ( ! selectedPlan || ! selectedFeature ) {
			return null;
		}

		const selectedPlanGroup = gridPlans?.find( ( { planSlug } ) => planSlug === selectedPlan );

		if ( ! selectedPlanGroup?.features ) {
			return null;
		}

		for ( const featureType of Object.values( selectedPlanGroup.features ) ) {
			if ( Array.isArray( featureType ) ) {
				const foundFeature = featureType?.find(
					( feature ) => feature?.getSlug() === selectedFeature
				);
				if ( foundFeature ) {
					return foundFeature;
				}
			} else if (
				featureType &&
				typeof featureType === 'object' &&
				featureType?.getSlug() === selectedFeature
			) {
				return featureType;
			}
		}
		return null;
	}, [ gridPlans, selectedFeature, selectedPlan ] );

	if ( selectedFeatureData ) {
		return {
			slug: selectedFeature as string,
			title: selectedFeatureData.getTitle(),
			description: selectedFeatureData.getDescription(),
		};
	}

	return null;
};

export default useSelectedFeature;
