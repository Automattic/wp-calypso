import { SelectControl } from '@wordpress/components';
import { numberFormat, useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';

import './style.scss';

type Props = {
	options: number[];
	value: number;
	onChange: ( value: number ) => void;
};

export function BundlePriceSelector( { options, value, onChange }: Props ) {
	const translate = useTranslate();

	const getDiscountPercentage = useCallback(
		( bundleSize: number ) => {
			// FIXME: Need to calculate based on average discount per bundle size.
			return (
				{
					1: '',
					5: translate( '10%' ),
					10: translate( '20%' ),
					20: translate( '40%' ),
					50: translate( '70%' ),
					100: translate( '80%' ),
				}[ bundleSize ] ?? ''
			);
		},
		[ translate ]
	);

	const getLabel = useCallback(
		( option: number ) => {
			return option > 1
				? translate( 'Buy %(size)d licenses and {{b}}save up to %(discount)s{{/b}}', {
						components: {
							b: <b />,
						},
						args: {
							size: option,
							discount: getDiscountPercentage( option ),
						},
						comment: '%(size)s is the number of licenses, %(discount)s is the discount percentage',
				  } )
				: translate( 'Buy single license' );
		},
		[ translate, getDiscountPercentage ]
	);

	return (
		<SelectControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ translate( 'Bundle size' ) }
			labelPosition="side"
			value={ value }
			onChange={ onChange }
			options={ [
				{
					disabled: true,
					label: translate( 'Explore bundle discounts to apply' ),
					value: '1',
				},
				...options.map( ( option ) => ( {
					label: getLabel( option ) as string,
					value: `${ numberFormat( option ) }`,
				} ) ),
			] }
		/>
	);
}
