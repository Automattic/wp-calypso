import { FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';

type Props = {
	setProducts: ( tokens: ( string | TokenItem )[] ) => void;
	selectedProducts: ( string | TokenItem )[];
};

const ProductsSelector = ( { setProducts, selectedProducts }: Props ) => {
	const availableProducts: Record< string, string > = {
		wordpress: 'WordPress',
		woocommerce: 'WooCommerce',
		jetpack: 'Jetpack',
		wordpress_vip: 'WordPress VIP',
		pressable: 'Pressable',
	};

	const setTokens = ( tokens: ( string | TokenItem )[] ) => {
		const selectedServicesByToken = tokens.filter( ( token ) => {
			return Object.keys( availableProducts ).find(
				( key: string ) => availableProducts?.[ key ] === token
			);
		} );

		setProducts( selectedServicesByToken );
	};

	return (
		<FormTokenField
			__experimentalAutoSelectFirstMatch
			__experimentalExpandOnFocus
			__experimentalShowHowTo={ false }
			__nextHasNoMarginBottom
			label=""
			onChange={ setTokens }
			suggestions={ Object.values( availableProducts ) }
			value={ selectedProducts }
		/>
	);
};

export default ProductsSelector;
