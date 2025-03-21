/**
 * Internal dependencies
 */
import { useLink } from '../../hooks';
import { type NavigationOptions } from '../../types';

export function Link( {
	to,
	options,
	children,
	...props
}: {
	to: string;
	options?: NavigationOptions;
	children: React.ReactNode;
} ) {
	const { href, onClick } = useLink( to, options );

	return (
		<a href={ href } onClick={ onClick } { ...props }>
			{ children }
		</a>
	);
}
