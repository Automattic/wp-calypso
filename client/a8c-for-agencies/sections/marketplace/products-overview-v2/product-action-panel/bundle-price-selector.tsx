import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

type Props = {
	options: number[];
	value: number;
	onChange: ( value: number ) => void;
};

export function BundlePriceSelector( { options, value, onChange }: Props ) {
	const translate = useTranslate();
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );

	const buttonRef = useRef( null );

	const onSelect = useCallback(
		( option: number ) => {
			setIsMenuOpen( false );
			onChange( option );
		},
		[ onChange ]
	);

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
		<>
			<div className="bundle-price-selector">
				<div className="bundle-price-selector__label">{ translate( 'Bundle & save' ) }</div>
				<Button
					ref={ buttonRef }
					className="bundle-price-selector__menu-button"
					variant="secondary"
					onClick={ () => setIsMenuOpen( ! isMenuOpen ) }
				>
					{ value > 1 ? getLabel( value ) : translate( 'Explore bundle discounts to apply' ) }
					<Icon icon={ chevronDown } />
				</Button>
			</div>

			<PopoverMenu
				isVisible={ isMenuOpen }
				onClose={ () => setIsMenuOpen( false ) }
				context={ buttonRef.current }
				className="bundle-price-selector__popover"
				autoPosition={ false }
				position="bottom right"
			>
				{ options.map( ( option ) => (
					<PopoverMenuItem
						className={ clsx( {
							'is-selected': value === option,
						} ) }
						onClick={ () => onSelect( option ) }
						key={ `bundle-price-option-${ option }` }
					>
						{ getLabel( option ) }
					</PopoverMenuItem>
				) ) }
			</PopoverMenu>
		</>
	);
}
