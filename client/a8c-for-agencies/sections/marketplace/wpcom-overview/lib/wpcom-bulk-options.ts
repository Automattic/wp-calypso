import { isEnabled } from '@automattic/calypso-config';

const wpcomBulkOptions = (
	discountOptions?: {
		quantity: number;
		discount_percent: number;
	}[]
) => {
	const isNewHostingPage = isEnabled( 'a4a-hosting-page-redesign' );

	if ( ! discountOptions || discountOptions.length === 0 ) {
		return [
			{
				value: 1,
				label: '1',
				discount: 0,
				sub: '',
			},
		];
	}

	const options = discountOptions.map( ( option ) => ( {
		value: option.quantity || 1,
		label: option.quantity ? `${ option.quantity }` : '1',
		sub: option.discount_percent ? `${ Math.floor( option.discount_percent * 100 ) }%` : '',
		discount: option.discount_percent ? option.discount_percent : 0,
	} ) );

	if ( options[ 0 ].value !== 1 ) {
		// We need to make sure that the first option is always 1 to allow user to purchase a single site.
		options.unshift(
			{
				value: 1,
				label: '1',
				discount: 0,
				sub: '',
			},
			...( isNewHostingPage ? [ { value: 2, label: '2', discount: 0, sub: '' } ] : [] )
		);
	}

	return options;
};

export default wpcomBulkOptions;
