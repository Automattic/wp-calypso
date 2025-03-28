/**
 * Internal dependencies
 */
import { useLink } from '../../hooks';
import { type NavigationOptions } from '../../types';

type LinkProps = Omit< React.ComponentPropsWithoutRef< 'a' >, 'href' | 'onClick' > & {
	to: string;
	options?: NavigationOptions;
	children: React.ReactNode;
};

export function Link( { to, options, children, ...props }: LinkProps ) {
	const { href, onClick } = useLink( to, options );

	return (
		<a { ...props } href={ href } onClick={ onClick }>
			{ children }
		</a>
	);
}
