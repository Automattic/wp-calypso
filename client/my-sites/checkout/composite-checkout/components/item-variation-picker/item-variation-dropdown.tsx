import { Gridicon } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FunctionComponent, useState } from 'react';
import { useGetProductVariants } from '../../hooks/product-variants';
import type { ItemVariationPickerProps } from './types';

interface OptionProps {
	selected?: boolean;
}

const Option = styled.div< OptionProps >`
	align-items: center;
	background: white;
	border: 1px solid #a7aaad;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 14px;

	.gridicon {
		fill: #a7aaad;
		margin-left: 14px;
	}

	${ ( props ) =>
		props.selected &&
		css`
			background: #055d9c;
			color: #ffff;
		` }
`;

const Dropdown = styled.div`
	position: relative;
	width: 100%;
	> ${ Option } {
		border-radius: 3px;
	}
`;

const OptionList = styled.div`
	position: absolute;
	width: 100%;
	z-index: 3;

	${ Option } {
		margin-top: -1px;

		&:last-child {
			border-bottom-left-radius: 3px;
			border-bottom-right-radius: 3px;
		}
	}
`;

const VariantLabel = styled.span`
	flex: 1;
	display: flex;
`;

export const ItemVariationDropDown: FunctionComponent< ItemVariationPickerProps > = ( {
	selectedItem,
	onChangeItemVariant,
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
					<Option
						role="button"
						tabIndex={ 0 }
						key="selectedItem"
						onClick={ () => setOpen( ! open ) }
					>
						<VariantLabel>{ variantLabel }</VariantLabel>
						{ variantDetails }
						<Gridicon icon={ open ? 'chevron-down' : 'chevron-up' } />
					</Option>
				) ) }
			{ open && (
				<OptionList>
					{ variants.map( ( { variantLabel, variantPrice, productId, productSlug } ) => (
						<Option
							role="button"
							tabIndex={ 0 }
							key={ productSlug + variantLabel }
							onClick={ () => onChangeItemVariant( selectedItem.uuid, productSlug, productId ) }
							selected={ productId === selectedItem.product_id }
						>
							<span>{ variantLabel }</span>
							<span>{ variantPrice }</span>
						</Option>
					) ) }
				</OptionList>
			) }
		</Dropdown>
	);
};
