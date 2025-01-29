type Option = {
	label: string;
	value: number | string | null;
	sub?: string;
};

export type DiscountTier = Option & {
	discount: number;
};

export const calculateTier = ( options: DiscountTier[], value: number ) => {
	let tier = options[ 0 ];

	for ( const option of options ) {
		if ( Number( option.value ) > value ) {
			break;
		}

		tier = option;
	}

	return {
		...tier,
		value,
	};
};
