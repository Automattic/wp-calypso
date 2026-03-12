import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap } from './hooks/use-form-selectors';

type Props = {
	availableOptions: Record< string, string >;
	selectedSlugs: string[];
	onChange: ( slugs: string[] ) => void;
	sortSuggestions?: boolean;
};

const TokenFieldSelector = ( {
	availableOptions,
	selectedSlugs,
	onChange,
	sortSuggestions,
}: Props ) => {
	const optionsByLabel = useMemo( () => reverseMap( availableOptions ), [ availableOptions ] );

	const selectedByLabel = selectedSlugs.flatMap( ( slug ) => {
		const value = availableOptions[ slug ];
		return value ? [ value ] : [];
	} );

	const onSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return optionsByLabel[ label as string ];
			} );
			onChange( selectedBySlug );
		},
		[ optionsByLabel, onChange ]
	);

	const suggestions = Object.values( availableOptions );

	return (
		<FormTokenFieldWrapper
			onChange={ onSelected }
			suggestions={ sortSuggestions ? suggestions.sort() : suggestions }
			value={ selectedByLabel }
		/>
	);
};

export default TokenFieldSelector;
