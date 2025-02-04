import { useEffect, useState } from 'react';
import { useRecordPaged } from '../tracks';

const usePagination = (
	page: number,
	pageChanged: ( page: number ) => void,
	isFetching: boolean
) => {
	const [ currentPage, setCurrentPage ] = useState( page );
	const recordPaged = useRecordPaged();
	const pageChangeCallback = ( page: number ) => {
		recordPaged( { page } );
		setCurrentPage( page );
	};

	useEffect( () => {
		if ( ! isFetching && currentPage !== page ) {
			pageChanged( currentPage );
		}
	}, [ currentPage, isFetching, page, pageChanged ] );

	return { pageChangeCallback };
};

export default usePagination;
