import { __experimentalHStack as HStack } from '@wordpress/components';
import { DomainSearchFilters } from './Filters';
import { DomainSearchControlsInput } from './Input';

const DomainSearchControls = () => {
	return (
		<HStack spacing={ 2 }>
			<DomainSearchControlsInput />
			<DomainSearchFilters />
		</HStack>
	);
};

DomainSearchControls.Input = DomainSearchControlsInput;
DomainSearchControls.Filters = DomainSearchFilters;

export { DomainSearchControls };
