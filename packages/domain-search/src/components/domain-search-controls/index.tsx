import { __experimentalHStack as HStack } from '@wordpress/components';
import { DomainSearchControlsFilters } from './filters';
import { DomainSearchControlsInput } from './input';
import { DomainSearchControlsSubmit } from './submit';
import './style.scss';

const DomainSearchControls = () => {
	return (
		<HStack className="domain-search-controls__container" spacing={ 4 } alignment="right">
			<DomainSearchControlsInput />
			<div>
				<DomainSearchControlsSubmit />
			</div>
		</HStack>
	);
};

DomainSearchControls.Input = DomainSearchControlsInput;
DomainSearchControls.Submit = DomainSearchControlsSubmit;
DomainSearchControls.Filters = DomainSearchControlsFilters;

export { DomainSearchControls };
