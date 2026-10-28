import { __experimentalHStack as HStack } from '@wordpress/components';
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
		<HStack as="span" spacing={ 1 } justify="flex-start" expanded={ false }>
			<img
				className="wpnc-simplified__byline-avatar"
				src={ avatar }
				alt=""
				width={ 12 }
				height={ 12 }
			/>
			<span>{ children }</span>
		</HStack>
	);
}
