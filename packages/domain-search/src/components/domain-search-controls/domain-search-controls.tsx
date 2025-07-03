import { __experimentalHStack as HStack } from '@wordpress/components';
import { DomainSearchFilters } from './filters';
import { DomainSearchControlsInput } from './input';

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
