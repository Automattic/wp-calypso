import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setCompanySizes: ( companySizes: string[] ) => void;
	selectedCompanySizes: string[];
};

const CompanySizesSelector = ( { setCompanySizes, selectedCompanySizes }: Props ) => {
	const { availableCompanySizes } = useFormSelectors();

	const availableCompanySizesByLabel = useMemo(
		() => reverseMap( availableCompanySizes ),
		[ availableCompanySizes ]
	);

	const selectedCompanySizesByLabel = selectedCompanySizes.flatMap( ( slug ) => {
		const value = availableCompanySizes[ slug ];
		return value ? [ value ] : [];
	} );

	const onCompanySizesSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableCompanySizesByLabel[ label as string ];
			} );
			setCompanySizes( selectedBySlug );
		},
		[ availableCompanySizesByLabel, setCompanySizes ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onCompanySizesSelected }
			suggestions={ Object.values( availableCompanySizes ) }
			value={ selectedCompanySizesByLabel }
		/>
	);
};

export default CompanySizesSelector;
