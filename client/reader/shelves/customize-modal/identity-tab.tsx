import { TextControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { ShelfColorPicker } from 'calypso/reader/shelves/color-picker';
import { ShelfIconPicker } from 'calypso/reader/shelves/icon-picker';
import type { ShelfColor, ShelfIcon, ShelfTextColor } from '@automattic/api-core';

interface Props {
	name: string;
	onNameChange: ( name: string ) => void;
	nameError: string | null;
	color: ShelfTextColor;
	onColorChange: ( color: ShelfTextColor ) => void;
	iconColor: ShelfColor;
	onIconColorChange: ( color: ShelfColor ) => void;
	icon: ShelfIcon;
	onIconChange: ( icon: ShelfIcon ) => void;
}

export function IdentityTab( {
	name,
	onNameChange,
	nameError,
	color,
	onColorChange,
	iconColor,
	onIconColorChange,
	icon,
	onIconChange,
}: Props ) {
	const translate = useTranslate();
	const [ isNameTouched, setIsNameTouched ] = useState( false );

	return (
		<VStack spacing={ 5 }>
			<VStack spacing={ 4 }>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ translate( 'Name' ) }
					value={ name }
					placeholder={ translate( 'e.g. Design, News, Recipes…' ) }
					onChange={ ( value ) => {
						setIsNameTouched( true );
						onNameChange( value );
					} }
				/>
				{ isNameTouched && nameError ? (
					<p className="customize-shelf-modal__error" role="alert">
						{ nameError }
					</p>
				) : null }
			</VStack>

			<VStack spacing={ 2 }>
				<span className="customize-shelf-modal__field-label">{ translate( 'Icon' ) }</span>
				<ShelfIconPicker value={ icon } onChange={ onIconChange } />
			</VStack>

			<VStack spacing={ 2 }>
				<span className="customize-shelf-modal__field-label">{ translate( 'Icon color' ) }</span>
				<ShelfColorPicker
					value={ iconColor }
					onChange={ ( value ) => value !== 'none' && onIconColorChange( value ) }
					name="shelf-icon-color"
					label={ translate( 'Icon color' ) }
				/>
			</VStack>

			<VStack spacing={ 2 } className="customize-shelf-modal__color-selection">
				<span className="customize-shelf-modal__field-label">{ translate( 'Accent color' ) }</span>
				<p className="customize-shelf-modal__field-help">
					{ translate( 'Changes the color of post titles and actions in this shelf.' ) }
				</p>
				<ShelfColorPicker
					value={ color }
					onChange={ onColorChange }
					allowNone
					name="shelf-accent-color"
					label={ translate( 'Accent color' ) }
				/>
			</VStack>
		</VStack>
	);
}
