/**
 * External dependencies
 */
import { useCallback } from '@wordpress/element';
/**
 * Internal dependencies
 */
import { useLink } from '../../hooks';
import { type NavigationOptions } from '../../types';

type LinkProps = Omit< React.ComponentPropsWithoutRef< 'a' >, 'href' > & {
	to: string;
	options?: NavigationOptions;
	children: React.ReactNode;
};

export function Link( { to, options, children, onClick: onClickProp, ...props }: LinkProps ) {
	const { href, onClick } = useLink( to, options );

	const handleClickEvent = useCallback(
		( event: React.MouseEvent< HTMLAnchorElement > ) => {
			onClickProp?.( event );
			onClick?.( event );
		},
		[ onClick, onClickProp ]
	);

	return (
		<a { ...props } href={ href } onClick={ handleClickEvent }>
			{ children }
		</a>
	);
}
