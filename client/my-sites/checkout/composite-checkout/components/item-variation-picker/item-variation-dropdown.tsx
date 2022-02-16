import styled from '@emotion/styled';
import { FunctionComponent, useState } from 'react';
import { useGetProductVariants } from '../../hooks/product-variants';
import type { ItemVariationPickerProps } from './types';

const Dropdown = styled.div`
	width: 100%;
`;

const Option = styled.div`
	border: 1px solid #a7aaad;
	border-radius: 3px;
	padding: 14px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;

const VariantLabel = styled.span`
	flex: 1;
	display: flex;
`;

export const ItemVariationDropDown: FunctionComponent< ItemVariationPickerProps > = ( {
	selectedItem,
	onChangeItemVariant,
	isDisabled,
	siteId,
	productSlug,
} ) => {
	const variants = useGetProductVariants( siteId, productSlug );

	const [ open, setOpen ] = useState( false );

	if ( variants.length < 2 ) {
		return null;
	}

	return (
		<Dropdown>
			{ variants
				.filter( ( { productId } ) => productId === selectedItem.product_id )
				.map( ( { variantLabel, variantDetails } ) => (
					<Option key="selectedItem" onClick={ () => setOpen( ! open ) }>
						<VariantLabel>{ variantLabel }</VariantLabel>
						{ variantDetails }
					</Option>
				) ) }
			{ open &&
				variants.map( ( { variantLabel, variantPrice, productId, productSlug } ) => (
					<Option
						key={ productSlug + variantLabel }
						onClick={ () => onChangeItemVariant( selectedItem.uuid, productSlug, productId ) }
					>
						<span>{ variantLabel }</span>
						<span>{ variantPrice }</span>
					</Option>
				) ) }
		</Dropdown>
	);
};
