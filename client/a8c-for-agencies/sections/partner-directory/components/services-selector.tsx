import { FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useFormSelectors } from '../agency-details/hooks/use-form-selectors';

type Props = {
	setServices: ( services: ( string | TokenItem )[] ) => void;
	selectedServices: ( string | TokenItem )[];
};

const ServicesSelector = ( { setServices, selectedServices }: Props ) => {
	const { availableServices } = useFormSelectors();

	return (
		<FormTokenField
			__experimentalAutoSelectFirstMatch
			__experimentalExpandOnFocus
			__experimentalShowHowTo={ false }
			__nextHasNoMarginBottom
			label=""
			onChange={ setServices }
			suggestions={ Object.values( availableServices ) }
			value={ selectedServices }
		/>
	);
};

export default ServicesSelector;
