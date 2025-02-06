import {
	getCategoryType,
	useDesignPickerFilters,
	DESIGN_TIER_CATEGORIES,
} from '@automattic/design-picker';
import { useMemo } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

interface Props {
	preselectedFilters: string[];
	isBigSkyEligible: boolean;
}

const useTrackFilters = ( { preselectedFilters, isBigSkyEligible }: Props ) => {
	const { selectedCategories, selectedDesignTiers } = useDesignPickerFilters();

	const isIncludedWithPlan = selectedDesignTiers.includes( DESIGN_TIER_CATEGORIES.FREE );

	const filters = useMemo( () => {
		return selectedCategories.reduce(
			( result, filterSlug, index ) => ( {
				...result,
				// The property cannot contain `-` character.
				[ `filters_${ filterSlug.replaceAll( '-', '_' ) }` ]: `${ getCategoryType(
					filterSlug
				) }:${ index }`,
			} ),
			{}
		);
	}, [ selectedCategories ] );

	const commonFilterProperties = {
		is_filter_included_with_plan_enabled: isIncludedWithPlan,
		is_big_sky_eligible: isBigSkyEligible,
		preselected_filters: preselectedFilters.join( ',' ),
		selected_filters: selectedCategories.join( ',' ),
		...filters,
	};

	const handleSelectFilter = ( term: string, type?: string ) => {
		recordTracksEvent( 'calypso_design_picker_select_filter', {
			...commonFilterProperties,
			filter_type: type || getCategoryType( term ),
			filter_term: term,
		} );
	};

	const handleDeselectFilter = ( term: string, type?: string ) => {
		recordTracksEvent( 'calypso_design_picker_deselect_filter', {
			...commonFilterProperties,
			filter_type: type || getCategoryType( term ),
			filter_term: term,
		} );
	};

	return {
		commonFilterProperties,
		handleSelectFilter,
		handleDeselectFilter,
	};
};

export default useTrackFilters;
