import { FormTokenField, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import {
	SPACE_LANGUAGE_SUGGESTIONS,
	getLanguageCodeByName,
	getLanguageName,
	resolveLanguageTokens,
} from 'calypso/reader/spaces/languages';

interface Props {
	tags: string[];
	onTagsChange: ( tags: string[] ) => void;
	languages: string[];
	onLanguagesChange: ( languages: string[] ) => void;
}

export function TopicsTab( { tags, onTagsChange, languages, onLanguagesChange }: Props ) {
	const translate = useTranslate();

	return (
		<VStack spacing={ 4 }>
			<p className="customize-space-modal__field-help">
				{ translate(
					'Besides posts from the feeds you follow, this space can show posts that match these tags, in the languages you choose.'
				) }
			</p>
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
	);
}
