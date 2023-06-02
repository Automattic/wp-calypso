import { useState } from 'react';
import { useDebounce } from 'use-debounce';

const useSearch = () => {
	const [ searchTerm, setSearchTerm ] = useState< string >();
	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 300 );

	const handleSearch = ( value: string ) => {
		setSearchTerm( value );
	};

	return { searchTerm: debouncedSearchTerm, handleSearch };
};

export default useSearch;
