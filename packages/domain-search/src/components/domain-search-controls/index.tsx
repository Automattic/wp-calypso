import { __experimentalHStack as HStack } from '@wordpress/components';
import { DomainSearchFilters } from './filters';
import { DomainSearchControlsInput } from './input';
import { DomainSearchSubmit } from './submit';
import './style.scss';

const DomainSearchControls = () => {
	return (
		<HStack className="domain-search-controls__container" spacing={ 4 } alignment="right">
			<DomainSearchControlsInput />
			<div>
				<DomainSearchSubmit />
			</div>
		</HStack>
	);
};

DomainSearchControls.Input = DomainSearchControlsInput;
DomainSearchControls.Filters = DomainSearchFilters;
DomainSearchControls.Submit = DomainSearchSubmit;

export { DomainSearchControls };
