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

	const getDiscountPercentage = useCallback( ( bundleSize: number ) => {
		// FIXME: Need to calculate based on average discount per bundle size.
		return (
			{
				1: '',
				5: numberFormat( 0.1, {
					numberFormatOptions: { style: 'percent' },
				} ),
				10: numberFormat( 0.2, {
					numberFormatOptions: { style: 'percent' },
				} ),
				20: numberFormat( 0.4, {
					numberFormatOptions: { style: 'percent' },
				} ),
				50: numberFormat( 0.7, {
					numberFormatOptions: { style: 'percent' },
				} ),
				100: numberFormat( 0.8, {
					numberFormatOptions: { style: 'percent' },
				} ),
			}[ bundleSize ] ?? ''
		);
	}, [] );

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
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore -- value is a number, not a string
			value={ value }
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore -- value is a number, not a string
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
