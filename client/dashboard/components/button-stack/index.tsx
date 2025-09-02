import { __experimentalHStack as HStack } from '@wordpress/components';
import { ReactNode } from 'react';
import type { ComponentProps } from 'react';

type ButtonStackProps = {
	children: ReactNode;
};

export function ButtonStack( {
	children,
	...hStackProps
}: ButtonStackProps & Omit< ComponentProps< typeof HStack >, 'spacing' > ) {
	return (
		<HStack { ...hStackProps } spacing={ 3 }>
			{ children }
		</HStack>
	);
}
