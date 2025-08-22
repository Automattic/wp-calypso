import { __experimentalVStack as VStack } from '@wordpress/components';

import './style.scss';

export const DomainsFullCartItems = ( { children }: { children: React.ReactNode } ) => {
	return <VStack spacing={ 3 }>{ children }</VStack>;
};
