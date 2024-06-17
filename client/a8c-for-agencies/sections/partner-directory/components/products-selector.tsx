import { FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setProducts: ( tokens: ( string | TokenItem )[] ) => void;
	selectedProducts: ( string | TokenItem )[];
};

const ProductsSelector = ( { setProducts, selectedProducts }: Props ) => {
	const { availableProducts } = useFormSelectors();

	// Get the reverse map of available products
	const availableProductsByLabel = useMemo(
		() => reverseMap( availableProducts ),
		[ availableProducts ]
	);

	// Get the selected products by label
	const selectedProductsByLabel = selectedProducts.map( ( slug ) => {
		const key = slug as string;
		return availableProducts[ key ];
	} );

	// Set the selected products by slug
	const onProductLabelsSelected = useCallback(
		( selectedProductLabels: ( string | TokenItem )[] ) => {
			const selectedProductsBySlug = selectedProductLabels.map( ( label ) => {
				const key = label as string;
				return availableProductsByLabel[ key ];
			} );
			setProducts( selectedProductsBySlug );
		},
		[ availableProductsByLabel ]
	);

	return (
		<FormTokenField
			__experimentalAutoSelectFirstMatch
			__experimentalExpandOnFocus
			__experimentalShowHowTo={ false }
			__nextHasNoMarginBottom
			label=""
			onChange={ onProductLabelsSelected }
			suggestions={ Object.values( availableProducts ) }
			value={ selectedProductsByLabel }
		/>
	);
};

export default ProductsSelector;
