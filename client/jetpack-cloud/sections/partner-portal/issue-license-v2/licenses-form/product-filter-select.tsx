import { SelectDropdown } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import {
	PRODUCT_FILTER_ALL,
	PRODUCT_FILTER_PLANS,
	PRODUCT_FILTER_PRODUCTS,
	PRODUCT_FILTER_VAULTPRESS_BACKUP_ADDONS,
	PRODUCT_FILTER_WOOCOMMERCE_EXTENSIONS,
} from '../constants';

type Props = {
	selectedProductFilter: string | null;
	onClick?: () => void;
	onProductFilterSelect: ( value: string | null ) => void;
	isSingleLicense?: boolean;
};

type Option = {
	value?: string | null;
	label: string;
};

const getOptionByValue = ( options: Option[], value: string | null ): Option => {
	return options.find( ( option ) => option.value === value ) ?? options[ 0 ];
};

export default function ProductFilterSelect( {
	selectedProductFilter,
	onClick,
	onProductFilterSelect,
	isSingleLicense,
}: Props ) {
	const translate = useTranslate();

	const productFilterOptions = useMemo< Option[] >( () => {
		const options = [
			{
				value: PRODUCT_FILTER_ALL,
				label: translate( 'All' ),
			},
			{
				value: PRODUCT_FILTER_PLANS,
				label: translate( 'Plans' ),
			},
			{
				value: PRODUCT_FILTER_PRODUCTS,
				label: translate( 'Products' ),
			},
		];

		if ( isSingleLicense ) {
			options.push(
				{
					value: PRODUCT_FILTER_WOOCOMMERCE_EXTENSIONS,
					label: translate( 'WooCommerce Extensions' ),
				},
				{
					value: PRODUCT_FILTER_VAULTPRESS_BACKUP_ADDONS,
					label: translate( 'VaultPress Backup Add-ons' ),
				}
			);
		}

		return options;
	}, [ isSingleLicense, translate ] );

	const currentSelectedOption = getOptionByValue( productFilterOptions, selectedProductFilter );

	const selectedText = translate( '{{b}}Products{{/b}}: %(productFilter)s', {
		args: {
			productFilter: currentSelectedOption.label as string,
		},
		components: {
			b: <b />,
		},
		comment: 'productFilter is the selected filter type.',
	} );

	const onToggle = useCallback(
		( { open }: { open: boolean } ) => {
			if ( open ) {
				onClick?.();
			}
		},
		[ onClick ]
	);

	useEffect( () => {
		if (
			! isSingleLicense &&
			( selectedProductFilter === PRODUCT_FILTER_WOOCOMMERCE_EXTENSIONS ||
				selectedProductFilter === PRODUCT_FILTER_VAULTPRESS_BACKUP_ADDONS )
		) {
			onProductFilterSelect( PRODUCT_FILTER_ALL );
		}
	}, [ isSingleLicense, onProductFilterSelect, selectedProductFilter ] );

	return (
		<SelectDropdown
			className="licenses-form__product-filter-select"
			selectedText={ selectedText }
			options={ productFilterOptions }
			onToggle={ onToggle }
			onSelect={ ( option: { value: string | null } ) => onProductFilterSelect( option.value ) }
			compact
		/>
	);
}
