import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setStoreComplexities: ( complexities: string[] ) => void;
	selectedStoreComplexities: string[];
};

const StoreComplexitiesSelector = ( {
	setStoreComplexities,
	selectedStoreComplexities,
}: Props ) => {
	const { availableStoreComplexities } = useFormSelectors();

	const availableStoreComplexitiesByLabel = useMemo(
		() => reverseMap( availableStoreComplexities ),
		[ availableStoreComplexities ]
	);

	const selectedStoreComplexitiesByLabel = selectedStoreComplexities.flatMap( ( slug ) => {
		const value = availableStoreComplexities[ slug ];
		return value ? [ value ] : [];
	} );

	const onStoreComplexitiesSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableStoreComplexitiesByLabel[ label as string ];
			} );
			setStoreComplexities( selectedBySlug );
		},
		[ availableStoreComplexitiesByLabel, setStoreComplexities ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onStoreComplexitiesSelected }
			suggestions={ Object.values( availableStoreComplexities ) }
			value={ selectedStoreComplexitiesByLabel }
		/>
	);
};

export default StoreComplexitiesSelector;
