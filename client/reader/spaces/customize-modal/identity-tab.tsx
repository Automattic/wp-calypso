import { FormTokenField, TextControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { SpaceColorPicker } from 'calypso/reader/spaces/color-picker';
import { SpaceIconPicker } from 'calypso/reader/spaces/icon-picker';
import type { SpaceColor, SpaceIcon } from '@automattic/api-core';

interface Props {
	name: string;
	onNameChange: ( name: string ) => void;
	nameError: string | null;
	tags: string[];
	onTagsChange: ( tags: string[] ) => void;
	color: SpaceColor;
	onColorChange: ( color: SpaceColor ) => void;
	icon: SpaceIcon;
	onIconChange: ( icon: SpaceIcon ) => void;
}

export function IdentityTab( {
	name,
	onNameChange,
	nameError,
	tags,
	onTagsChange,
	color,
	onColorChange,
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
				<FormTokenField
					__next40pxDefaultSize
					label={ translate( 'Tags' ) }
					value={ tags }
					placeholder={ translate( 'Add tags' ) }
					onChange={ ( tokens ) =>
						onTagsChange(
							tokens.map( ( token ) => ( typeof token === 'string' ? token : token.value ) )
						)
					}
					help={ translate( 'Type and press Enter to add; click x to remove.' ) }
				/>
			</VStack>

			<VStack spacing={ 2 }>
				<span className="customize-space-modal__field-label">{ translate( 'Accent color' ) }</span>
				<SpaceColorPicker value={ color } onChange={ onColorChange } />
			</VStack>

			<VStack spacing={ 2 }>
				<span className="customize-space-modal__field-label">{ translate( 'Icon' ) }</span>
				<SpaceIconPicker value={ icon } onChange={ onIconChange } />
			</VStack>
		</VStack>
	);
}
