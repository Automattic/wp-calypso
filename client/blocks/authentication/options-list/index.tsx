import { __experimentalVStack as VStack } from '@wordpress/components';
import type { ReactNode } from 'react';

type OptionsListProps = {
	children: ReactNode;
};

const OptionsList = ( { children }: OptionsListProps ) => (
	<VStack as="div" spacing={ 2 } role="group">
		{ children }
	</VStack>
);

export default OptionsList;
