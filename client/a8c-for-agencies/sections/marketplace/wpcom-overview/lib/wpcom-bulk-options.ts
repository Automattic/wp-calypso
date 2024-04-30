const wpcomBulkOptions = (
	discountOptions?: {
		quantity: number;
		discount_percent: number;
	}[]
) => {
	if ( ! discountOptions || discountOptions.length === 0 ) {
		return [
			{
				value: 1,
				label: '1',
				discount: 0,
			},
		];
	}
	return discountOptions.map( ( option ) => ( {
		value: option.quantity || 1,
		label: option.quantity ? `${ option.quantity }` : '1',
		sub: option.discount_percent ? `${ option.discount_percent }%` : '',
		discount: option.discount_percent ? option.discount_percent / 100 : 0,
	} ) );
};

export default wpcomBulkOptions;
