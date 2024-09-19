import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setIndustries: ( industries: ( string | TokenItem )[] ) => void;
	industries: string[];
};

const IndustriesSelector = ( { setIndustries, industries }: Props ) => {
	const { availableIndustries } = useFormSelectors();

	// Get the reverse map of available industries
	const availableIndustriesByLabel = useMemo(
		() => reverseMap( availableIndustries ),
		[ availableIndustries ]
	);

	// Set the selected industries by slug
	const handleSetIndustries = useCallback(
		( selectedIndustries: ( string | TokenItem )[] ) => {
			const selectedIndustriesBySlug = selectedIndustries.map( ( label ) => {
				const key = label as string;
				return availableIndustriesByLabel[ key ];
			} );

			setIndustries( selectedIndustriesBySlug );
		},
		[ availableIndustriesByLabel, setIndustries ]
	);

	// Get the selected industries by label
	const selectedIndustriesByLabel = industries.flatMap( ( slug ) => {
		const key = slug as string;
		const value = availableIndustries[ key ];
		return value ? [ value ] : [];
	} );

	return (
		<FormTokenFieldWrapper
			onChange={ handleSetIndustries }
			suggestions={ Object.values( availableIndustries ).sort() }
			value={ selectedIndustriesByLabel }
		/>
	);
};

export default IndustriesSelector;
