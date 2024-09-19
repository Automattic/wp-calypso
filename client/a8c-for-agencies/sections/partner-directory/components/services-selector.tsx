import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setServices: ( services: string[] ) => void;
	selectedServices: string[];
};

const MAX_SERVICES = 5;

const ServicesSelector = ( { setServices, selectedServices }: Props ) => {
	const { availableServices } = useFormSelectors();

	// Get the reverse map of available services
	const availableServicesByLabel = useMemo(
		() => reverseMap( availableServices ),
		[ availableServices ]
	);

	// Get the selected services by label
	const selectedServicesByLabel = selectedServices.flatMap( ( slug ) => {
		const key = slug as string;
		const value = availableServices[ key ];
		return value ? [ value ] : [];
	} );

	// Set the selected services by slug
	const onServiceLabelsSelected = useCallback(
		( selectedServiceLabels: ( string | TokenItem )[] ) => {
			const selectedServicesBySlug = selectedServiceLabels.map( ( label ) => {
				const key = label as string;
				return availableServicesByLabel[ key ];
			} );

			setServices( selectedServicesBySlug );
		},
		[ availableServicesByLabel, setServices ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onServiceLabelsSelected }
			suggestions={
				selectedServices.length >= MAX_SERVICES ? [] : Object.values( availableServices ).sort()
			}
			value={ selectedServicesByLabel }
		/>
	);
};

export default ServicesSelector;
