import { __experimentalHStack as HStack } from '@wordpress/components';
import NoteIcon from '../../note-icon';
import type { ReactNode } from 'react';

/**
 * Renders an author's name, preceded by their small avatar when one is available.
 */
export default function Author( {
	avatar,
	children,
}: {
	avatar?: string | null;
	children: ReactNode;
} ) {
	if ( ! avatar ) {
		return <>{ children }</>;
	}

	return (
		<HStack as="span" spacing={ 1.5 } justify="flex-start" expanded={ false }>
			<NoteIcon icon={ avatar } size={ 16 } />
			<span>{ children }</span>
		</HStack>
	);
}
