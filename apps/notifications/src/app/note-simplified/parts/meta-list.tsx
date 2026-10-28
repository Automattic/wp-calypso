import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import { Children } from 'react';
import type { ReactNode } from 'react';

/**
 * Renders a row of metadata items separated by dots, skipping empty items.
 */
export default function MetaList( { children }: { children: ReactNode } ) {
	const items = Children.toArray( children ).filter( Boolean );

	if ( ! items.length ) {
		return null;
	}

	return (
		<Text
			className="wpnc-simplified__meta wpnc-simplified__quiet-links"
			size={ 12 }
			lineHeight="16px"
			variant="muted"
		>
			{ items.map( ( item, index ) => (
				<HStack key={ index } as="span" spacing={ 1 } justify="flex-start" expanded={ false }>
					{ item }
				</HStack>
			) ) }
		</Text>
	);
}
