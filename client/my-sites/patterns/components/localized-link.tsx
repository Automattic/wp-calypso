import { addLocaleToPathLocaleInFront, useLocale } from '@automattic/i18n-utils';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export function LocalizedLink( { children, href = '', ...props }: JSX.IntrinsicElements[ 'a' ] ) {
	const isLoggedIn = useSelector( isUserLoggedIn );

	// `addLocaleToPathLocaleInFront` retrieves the active locale differently from `useLocale`.
	// Crucially, it doesn't work with SSR unless we pass the `useLocale` value explicitly
	const locale = useLocale();
	const localizedHref = isLoggedIn ? href : addLocaleToPathLocaleInFront( href, locale );

	return (
		<a { ...props } href={ localizedHref }>
			{ children }
		</a>
	);
}
