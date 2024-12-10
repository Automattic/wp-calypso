import { getCategoryType } from '@automattic/design-picker';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

interface Props {
	preselectedFilters: string[];
	isBigSkyEligible: boolean;
	isMultiSelection: boolean;
}

const useTrackFilters = ( { preselectedFilters, isBigSkyEligible, isMultiSelection }: Props ) => {
	const [ searchParams ] = useSearchParams();

	const selectedFilters = searchParams.get( 'categories' )?.split( ',' ) || [];

	const isIncludedWithPlan = searchParams.get( 'tier' ) === 'free';

	const filters = useMemo( () => {
		return selectedFilters.reduce(
			( result, filterSlug, index ) => ( {
				...result,
				// The property cannot contain `-` character.
				[ `filters_${ filterSlug.replace( '-', '_' ) }` ]: `${ getCategoryType(
					filterSlug
				) }:${ index }`,
			} ),
			{}
		);
	}, [ selectedFilters ] );

	const commonFilterProperties = {
		is_filter_included_with_plan_enabled: isIncludedWithPlan,
		is_big_sky_eligible: isBigSkyEligible,
		preselected_filters: preselectedFilters.join( ',' ),
		selected_filters: selectedFilters.join( ',' ),
		...filters,
	};

	const handleSelectFilter = ( term: string, type?: string ) => {
		if ( ! isMultiSelection ) {
			recordTracksEvent( 'calypso_signup_unified_design_select_category', {
				category: term,
			} );
			return;
		}

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
