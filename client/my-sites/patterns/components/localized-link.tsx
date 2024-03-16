import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export function LocalizedLink( { children, href = '', ...props }: JSX.IntrinsicElements[ 'a' ] ) {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const localizedHref = ! isLoggedIn ? addLocaleToPathLocaleInFront( href ) : href;

	return (
		<a { ...props } href={ localizedHref }>
			{ children }
		</a>
	);
}
