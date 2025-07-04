import { __experimentalHStack as HStack } from '@wordpress/components';
import { DomainSearchControlsFilters } from './filters';
import { DomainSearchControlsFiltersList } from './filters-list';
import { DomainSearchControlsInput } from './input';
import { DomainSearchControlsSubmit } from './submit';
import './index.scss';

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
DomainSearchControls.FiltersList = DomainSearchControlsFiltersList;

export { DomainSearchControls };
