import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';

export default function NewTabLabel( {
	children,
	justify = 'center',
}: {
	children: ReactNode;
	justify?: 'center' | 'flex-start';
} ) {
	return (
		<HStack as="span" spacing={ 1 } justify={ justify } expanded={ false }>
			<span>{ children }</span>
			<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
		</HStack>
	);
}
