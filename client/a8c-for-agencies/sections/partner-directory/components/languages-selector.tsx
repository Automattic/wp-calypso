import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setLanguages: ( tokens: ( string | TokenItem )[] ) => void;
	selectedLanguages: string[];
};

const LanguagesSelector = ( { setLanguages, selectedLanguages = [] }: Props ) => {
	const { availableLanguages } = useFormSelectors();
	const languagesByLabel = useMemo(
		() => reverseMap( availableLanguages ),
		[ availableLanguages ]
	);

	const selectedLanguageLabels = selectedLanguages.flatMap( ( code ) => {
		const label = availableLanguages[ code ];
		return label ? [ label ] : [];
	} );

	const setLanguagesByCode = ( labels: ( string | TokenItem )[] ) => {
		setLanguages(
			labels.map( ( label ) => languagesByLabel[ label as string ] ).filter( Boolean )
		);
	};

	return (
		<FormTokenFieldWrapper
			onChange={ setLanguagesByCode }
			suggestions={ Object.values( availableLanguages ) }
			value={ selectedLanguageLabels }
		/>
	);
};

export default LanguagesSelector;
