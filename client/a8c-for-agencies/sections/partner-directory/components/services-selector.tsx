import { FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setServices: ( services: ( string | TokenItem )[] ) => void;
	selectedServices: ( string | TokenItem )[];
};

const ServicesSelector = ( { setServices, selectedServices }: Props ) => {
	const { availableServices } = useFormSelectors();

	// Get the reverse map of available services
	const availableServicesByLabel = useMemo(
		() => reverseMap( availableServices ),
		[ availableServices ]
	);

	// Get the selected services by label
	const selectedServicesByLabel = selectedServices.map( ( slug ) => {
		const key = slug as string;
		return availableServices[ key ];
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
		<FormTokenField
			__experimentalAutoSelectFirstMatch
			__experimentalExpandOnFocus
			__experimentalShowHowTo={ false }
			__nextHasNoMarginBottom
			label=""
			onChange={ onServiceLabelsSelected }
			suggestions={ Object.values( availableServices ) }
			value={ selectedServicesByLabel }
		/>
	);
};

export default ServicesSelector;
