import { FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setLanguages: ( tokens: ( string | TokenItem )[] ) => void;
	selectedLanguages: string[] | undefined;
};

const LanguagesSelector = ( { setLanguages, selectedLanguages }: Props ) => {
	const { availableLanguages } = useFormSelectors();

	// It converts the values selected into their keys
	const setLanguagesByCode = ( codes: ( string | TokenItem )[] ) => {
		const selectedLanguagesByCode = codes.filter( ( code ) => {
			return Object.keys( availableLanguages ).find(
				( key: string ) => availableLanguages?.[ key ] === code
			);
		} );

		setLanguages( selectedLanguagesByCode );
	};

	return (
		<FormTokenField
			__experimentalAutoSelectFirstMatch
			__experimentalExpandOnFocus
			__experimentalShowHowTo={ false }
			__nextHasNoMarginBottom
			label=""
			onChange={ setLanguagesByCode }
			suggestions={ Object.values( availableLanguages ) }
			value={ selectedLanguages }
		/>
	);
};

export default LanguagesSelector;
