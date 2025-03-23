/**
 * Internal dependencies
 */
import { useLink } from '../../hooks';
import { type NavigationOptions } from '../../types';

type LinkProps = React.ComponentPropsWithoutRef< 'a' > & {
	to: string;
	options?: NavigationOptions;
	children: React.ReactNode;
};

export function Link( { to, options, children, ...props }: LinkProps ) {
	const { href, onClick } = useLink( to, options );

	return (
		<a href={ href } onClick={ onClick } { ...props }>
			{ children }
		</a>
	);
}
