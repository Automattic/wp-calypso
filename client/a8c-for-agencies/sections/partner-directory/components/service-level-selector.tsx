import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	selectedServiceLevel: string;
	setServiceLevel: ( serviceLevel: string ) => void;
};

const ServiceLevelSelector = ( { selectedServiceLevel, setServiceLevel }: Props ) => {
	const { availableServiceLevels } = useFormSelectors();

	const options = [
		{ value: '', label: __( 'Select a maximum service level' ) },
		...Object.entries( availableServiceLevels ).map( ( [ value, label ] ) => ( {
			value,
			label,
		} ) ),
	];

	return (
		<SelectControl
			__next40pxDefaultSize
			value={ selectedServiceLevel }
			options={ options }
			onChange={ setServiceLevel }
		/>
	);
};

export default ServiceLevelSelector;
