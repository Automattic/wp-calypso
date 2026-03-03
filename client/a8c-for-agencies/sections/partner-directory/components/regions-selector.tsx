import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setRegions: ( regions: string[] ) => void;
	selectedRegions: string[];
};

const RegionsSelector = ( { setRegions, selectedRegions }: Props ) => {
	const { availableRegions } = useFormSelectors();

	const availableRegionsByLabel = useMemo(
		() => reverseMap( availableRegions ),
		[ availableRegions ]
	);

	const selectedRegionsByLabel = selectedRegions.flatMap( ( slug ) => {
		const value = availableRegions[ slug ];
		return value ? [ value ] : [];
	} );

	const onRegionLabelsSelected = useCallback(
		( selectedRegionLabels: ( string | TokenItem )[] ) => {
			const selectedRegionsBySlug = selectedRegionLabels.map( ( label ) => {
				return availableRegionsByLabel[ label as string ];
			} );
			setRegions( selectedRegionsBySlug );
		},
		[ availableRegionsByLabel, setRegions ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onRegionLabelsSelected }
			suggestions={ Object.values( availableRegions ) }
			value={ selectedRegionsByLabel }
		/>
	);
};

export default RegionsSelector;
