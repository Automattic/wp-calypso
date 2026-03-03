import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setBusinessTypes: ( businessTypes: string[] ) => void;
	selectedBusinessTypes: string[];
};

const BusinessTypesSelector = ( { setBusinessTypes, selectedBusinessTypes }: Props ) => {
	const { availableBusinessTypes } = useFormSelectors();

	const availableBusinessTypesByLabel = useMemo(
		() => reverseMap( availableBusinessTypes ),
		[ availableBusinessTypes ]
	);

	const selectedBusinessTypesByLabel = selectedBusinessTypes.flatMap( ( slug ) => {
		const value = availableBusinessTypes[ slug ];
		return value ? [ value ] : [];
	} );

	const onBusinessTypesSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableBusinessTypesByLabel[ label as string ];
			} );
			setBusinessTypes( selectedBySlug );
		},
		[ availableBusinessTypesByLabel, setBusinessTypes ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onBusinessTypesSelected }
			suggestions={ Object.values( availableBusinessTypes ).sort() }
			value={ selectedBusinessTypesByLabel }
		/>
	);
};

export default BusinessTypesSelector;
