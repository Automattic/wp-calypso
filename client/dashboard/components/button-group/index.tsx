import { __experimentalHStack as HStack } from '@wordpress/components';
import { ReactNode } from 'react';
import type { ComponentProps } from 'react';

type ButtonGroupProps = {
	children: ReactNode;
};

export default function ButtonGroup( {
	children,
	...hStackProps
}: ButtonGroupProps & ComponentProps< typeof HStack > ) {
	return (
		<HStack { ...hStackProps } spacing={ 3 }>
			{ children }
		</HStack>
	);
}
