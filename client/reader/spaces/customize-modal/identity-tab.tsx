import { TextControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { SpaceColorPicker } from 'calypso/reader/spaces/color-picker';
import { SpaceIconPicker } from 'calypso/reader/spaces/icon-picker';
import type { SpaceColor, SpaceIcon, SpaceTextColor } from '@automattic/api-core';

interface Props {
	name: string;
	onNameChange: ( name: string ) => void;
	nameError: string | null;
	color: SpaceTextColor;
	onColorChange: ( color: SpaceTextColor ) => void;
	iconColor: SpaceColor;
	onIconColorChange: ( color: SpaceColor ) => void;
	icon: SpaceIcon;
	onIconChange: ( icon: SpaceIcon ) => void;
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
					<p className="customize-space-modal__error" role="alert">
						{ nameError }
					</p>
				) : null }
			</VStack>

			<VStack spacing={ 2 }>
				<span className="customize-space-modal__field-label">{ translate( 'Icon' ) }</span>
				<SpaceIconPicker value={ icon } onChange={ onIconChange } />
			</VStack>

			<VStack spacing={ 2 }>
				<span className="customize-space-modal__field-label">{ translate( 'Icon color' ) }</span>
				<SpaceColorPicker
					value={ iconColor }
					onChange={ ( value ) => value !== 'none' && onIconColorChange( value ) }
					name="space-icon-color"
					label={ translate( 'Icon color' ) }
				/>
			</VStack>

			<VStack spacing={ 2 } className="customize-space-modal__color-selection">
				<span className="customize-space-modal__field-label">{ translate( 'Accent color' ) }</span>
				<p className="customize-space-modal__field-help">
					{ translate( 'Changes the color of post titles and actions in this space.' ) }
				</p>
				<SpaceColorPicker
					value={ color }
					onChange={ onColorChange }
					allowNone
					name="space-accent-color"
					label={ translate( 'Accent color' ) }
				/>
			</VStack>
		</VStack>
	);
}
