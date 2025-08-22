import { fetchProductsList } from './data';

export const productsQuery = () => ( {
	queryKey: [ 'products' ],
	queryFn: () => fetchProductsList(),
	refetchOnWindowFocus: false,
	refetchOnMount: false,
} );
