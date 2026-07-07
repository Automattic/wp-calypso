import { FormTokenField, TextControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { SpaceColorPicker } from 'calypso/reader/spaces/color-picker';
import { SpaceIconPicker } from 'calypso/reader/spaces/icon-picker';
import {
	SPACE_LANGUAGE_SUGGESTIONS,
	getLanguageCodeByName,
	getLanguageName,
	resolveLanguageTokens,
} from 'calypso/reader/spaces/languages';
import type { SpaceColor, SpaceIcon, SpaceTextColor } from '@automattic/api-core';

interface Props {
	name: string;
	onNameChange: ( name: string ) => void;
	nameError: string | null;
	tags: string[];
	onTagsChange: ( tags: string[] ) => void;
	languages: string[];
	onLanguagesChange: ( languages: string[] ) => void;
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
	tags,
	onTagsChange,
	languages,
	onLanguagesChange,
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
				<FormTokenField
					__next40pxDefaultSize
					__experimentalExpandOnFocus
					// Restrict tokens to known languages so only valid base codes are
					// stored; free-typed text that doesn't resolve to a language is rejected.
					__experimentalValidateInput={ ( input: string ) =>
						getLanguageCodeByName( input ) !== undefined
					}
					label={ translate( 'Languages' ) }
					// The field works in display names; the parent state is base codes.
					value={ languages.map( getLanguageName ) }
					suggestions={ SPACE_LANGUAGE_SUGGESTIONS }
					placeholder={ translate( 'Add languages' ) }
					onChange={ ( tokens ) => onLanguagesChange( resolveLanguageTokens( tokens, languages ) ) }
					help={ translate(
						'Filters Discover results to these languages. Starts from your account language; add more as needed.'
					) }
				/>
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
