import { __experimentalHStack as HStack } from '@wordpress/components';
import { Filter } from './filter';
import { Input } from './input';

import './style.scss';

export const SearchBar = () => {
	return (
		<HStack spacing={ 2 }>
			<Input />
			<Filter />
		</HStack>
	);
};
