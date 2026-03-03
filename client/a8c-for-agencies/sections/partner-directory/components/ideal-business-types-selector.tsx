import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setIdealBusinessTypes: ( idealBusinessTypes: string[] ) => void;
	selectedIdealBusinessTypes: string[];
};

const IdealBusinessTypesSelector = ( {
	setIdealBusinessTypes,
	selectedIdealBusinessTypes,
}: Props ) => {
	const { availableBusinessTypes } = useFormSelectors();

	const availableBusinessTypesByLabel = useMemo(
		() => reverseMap( availableBusinessTypes ),
		[ availableBusinessTypes ]
	);

	const selectedIdealBusinessTypesByLabel = selectedIdealBusinessTypes.flatMap( ( slug ) => {
		const value = availableBusinessTypes[ slug ];
		return value ? [ value ] : [];
	} );

	const onIdealBusinessTypesSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableBusinessTypesByLabel[ label as string ];
			} );
			setIdealBusinessTypes( selectedBySlug );
		},
		[ availableBusinessTypesByLabel, setIdealBusinessTypes ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onIdealBusinessTypesSelected }
			suggestions={ Object.values( availableBusinessTypes ).sort() }
			value={ selectedIdealBusinessTypesByLabel }
		/>
	);
};

export default IdealBusinessTypesSelector;
