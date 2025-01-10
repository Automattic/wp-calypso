import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

type Props = {
	options: number[];
	value: number;
	onChange: ( value: number ) => void;
};

const getDiscountPercentage = ( bundleSize: number ) => {
	// FIXME: Need to calculate based on average discount per bundle size.
	return (
		{
			1: '',
			5: '10%',
			10: '20%',
			20: '40%',
			50: '70%',
			100: '80%',
		}[ bundleSize ] ?? ''
	);
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
				: translate( 'Explore bundle discounts to apply' );
		},
		[ translate ]
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
					{ getLabel( value ) }
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
