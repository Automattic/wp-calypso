import { FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';

type Props = {
	setProducts: ( tokens: ( string | TokenItem )[] ) => void;
	selectedProducts: string[] | undefined;
};

const ProductsSelector = ( { setProducts, selectedProducts }: Props ) => {
	const availableProducts: string[] = [
		'WordPress',
		'WooCommerce',
		'Jetpack',
		'WordPress VIP',
		'Pressable',
	];

	return (
		<FormTokenField
			__experimentalAutoSelectFirstMatch
			__experimentalExpandOnFocus
			__experimentalShowHowTo={ false }
			__nextHasNoMarginBottom
			onChange={ setProducts }
			suggestions={ availableProducts }
			value={ selectedProducts }
		/>
	);
};

export default ProductsSelector;
