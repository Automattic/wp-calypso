import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setServiceLevels: ( serviceLevels: string[] ) => void;
	selectedServiceLevels: string[];
};

const ServiceLevelsSelector = ( { setServiceLevels, selectedServiceLevels }: Props ) => {
	const { availableServiceLevels } = useFormSelectors();

	const availableServiceLevelsByLabel = useMemo(
		() => reverseMap( availableServiceLevels ),
		[ availableServiceLevels ]
	);

	const selectedServiceLevelsByLabel = selectedServiceLevels.flatMap( ( slug ) => {
		const value = availableServiceLevels[ slug ];
		return value ? [ value ] : [];
	} );

	const onServiceLevelsSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableServiceLevelsByLabel[ label as string ];
			} );
			setServiceLevels( selectedBySlug );
		},
		[ availableServiceLevelsByLabel, setServiceLevels ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onServiceLevelsSelected }
			suggestions={ Object.values( availableServiceLevels ) }
			value={ selectedServiceLevelsByLabel }
		/>
	);
};

export default ServiceLevelsSelector;
