import { addLocaleToPathLocaleInFront, useLocale } from '@automattic/i18n-utils';
import { forwardRef } from 'react';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export const LocalizedLink = forwardRef< HTMLAnchorElement, JSX.IntrinsicElements[ 'a' ] >(
	( { children, href = '', onClick = () => {}, ...props }, ref ) => {
		const isLoggedIn = useSelector( isUserLoggedIn );

		// `addLocaleToPathLocaleInFront` retrieves the active locale differently from `useLocale`.
		// Crucially, it doesn't work with SSR unless we pass the `useLocale` value explicitly
		const locale = useLocale();
		const localizedHref = isLoggedIn ? href : addLocaleToPathLocaleInFront( href, locale );

		return (
			<a { ...props } href={ localizedHref } onClick={ onClick } ref={ ref }>
				{ children }
			</a>
		);
	}
);
