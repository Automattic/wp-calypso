import { __experimentalHStack as HStack } from '@wordpress/components';
import { Filter } from './filter';
import { Input } from './input';

import './style.scss';

export const SearchBar = () => {
	return (
		<HStack spacing={ 4 }>
			<Input />
			<Filter />
		</HStack>
	);
};
