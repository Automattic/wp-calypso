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
	return (
		<>
			{ avatar && (
				<img
					className="wpnc-simplified__byline-avatar"
					src={ avatar }
					alt=""
					width={ 12 }
					height={ 12 }
				/>
			) }
			{ children }
		</>
	);
}
