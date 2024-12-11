import { useSearchParams } from 'react-router-dom';

// The `currentSearchParams` parameter from the callback of the `setSearchParams` function
// might not have the latest query parameter on multiple calls at the same time.
const makeSearchParams = (
	callback: ( currentSearchParams: URLSearchParams ) => URLSearchParams
) => callback( new URLSearchParams( window.location.search ) );

const useCategoriesFilter = () => {
	const [ searchParams, setSearchParams ] = useSearchParams();
	const selectedCategories = searchParams.get( 'categories' )?.split( ',' ) || [];
	const setSelectedCategories = ( values: string[] ) => {
		setSearchParams(
			makeSearchParams( ( currentSearchParams ) => {
				if ( values.length > 0 ) {
					currentSearchParams.set( 'categories', values.join( ',' ) );
				} else {
					currentSearchParams.delete( 'categories' );
				}
				return currentSearchParams;
			} ),
			{ replace: true }
		);
	};

	return { selectedCategories, setSelectedCategories };
};

export const useDesignPickerFilters = () => {
	const { selectedCategories, setSelectedCategories } = useCategoriesFilter();

	return {
		selectedCategories,
		setSelectedCategories,
		resetFilters: () => {
			setSelectedCategories( [] );
		},
	};
};
