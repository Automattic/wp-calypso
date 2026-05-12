import { __experimentalHStack as HStack } from '@wordpress/components';
import { Filter } from './filter';
import { Input } from './input';

import './style.scss';

export const SearchBar = () => {
	return (
		<HStack className="domain-search__search-bar" spacing={ 4 }>
			<Input />
			<Filter />
		</HStack>
	);
};
