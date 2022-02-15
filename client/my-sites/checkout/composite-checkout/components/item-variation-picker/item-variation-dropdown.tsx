import styled from '@emotion/styled';
import { FunctionComponent } from 'react';
import { useGetProductVariants } from '../../hooks/product-variants';
import type { ItemVariationPickerProps, WPCOMProductVariant } from './types';

const TermOptions = styled.select`
	padding: 0;
`;

const TermOptionsItem = styled.option`
	padding: 0;
`;

export const ItemVariationDropDown: FunctionComponent< ItemVariationPickerProps > = ( {
	selectedItem,
	onChangeItemVariant,
	isDisabled,
	siteId,
	productSlug,
} ) => {
	const variants = useGetProductVariants( siteId, productSlug );

	if ( variants.length < 2 ) {
		return null;
	}

	return (
		<TermOptions
			disabled={ isDisabled }
			value={ `${ selectedItem.product_id.toString() }:${ selectedItem.product_slug }` }
			className="item-variation-dropdown"
			onChange={ ( event ) => {
				const [ productId, productSlug ] = event.target.value.split( ':' );
				onChangeItemVariant( selectedItem.uuid, productSlug, parseInt( productId ) );
			} }
		>
			{ variants.map( ( productVariant: WPCOMProductVariant ) => (
				<TermOptionsItem
					key={ productVariant.productId }
					value={ `${ productVariant.productId }:${ productVariant.productSlug }` }
				>
					{ productVariant.variantLabel }
				</TermOptionsItem>
			) ) }
		</TermOptions>
	);
};
