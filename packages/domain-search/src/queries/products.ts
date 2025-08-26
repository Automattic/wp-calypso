export interface Product {
	is_hsts_required?: boolean;
	is_dot_gay_notice_required?: boolean;
}

const fetchProductsList = async (): Promise< Record< string, Product > > => {
	await new Promise( ( resolve ) => setTimeout( resolve, Math.random() * 1_000 ) );

	return {
		dotapp_domain: {
			is_hsts_required: true,
		},
		dotgay_domain: {
			is_dot_gay_notice_required: true,
		},
	};
};

export const productsQuery = () => ( {
	queryKey: [ 'products' ],
	queryFn: () => fetchProductsList(),
	refetchOnWindowFocus: false,
	refetchOnMount: false,
} );
