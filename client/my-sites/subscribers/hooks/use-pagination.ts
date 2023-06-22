import { useEffect, useState } from 'react';

const usePagination = (
	page: number,
	pageChanged: ( page: number ) => void,
	isFetching: boolean
) => {
	const [ currentPage, setCurrentPage ] = useState( page );
	const pageClickCallback = ( page: number ) => setCurrentPage( page );
	useEffect( () => {
		if ( ! isFetching && currentPage !== page ) {
			pageChanged( currentPage );
		}
	}, [ currentPage, isFetching, page, pageChanged ] );

	return { pageClickCallback };
};

export default usePagination;
