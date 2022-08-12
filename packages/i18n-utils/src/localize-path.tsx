import { createHigherOrderComponent } from '@wordpress/compose';
import { getLocaleSlug } from 'i18n-calypso';
import { useCallback, ComponentType } from 'react';
import { useLocale } from './locale-context';
import { magnificentNonEnLocales, Locale } from './locales';

function getDefaultLocale(): Locale {
	return getLocaleSlug?.() ?? 'en';
}

export function localizePath(
	path: string,
	locale: Locale = getDefaultLocale(),
	isLoggedIn = true
): string {
	if ( typeof path !== 'string' || ! path.startsWith( '/' ) ) {
		return path;
	}
	const shouldPrefix =
		! isLoggedIn &&
		magnificentNonEnLocales.includes( locale ) &&
		! path.startsWith( `/${ locale }/` );

	return shouldPrefix ? `/${ locale }${ path }` : path;
}

export function useLocalizePath() {
	const providerLocale = useLocale();

	return useCallback(
		( path: string, locale?: Locale, isLoggedIn?: boolean ) => {
			if ( locale ) {
				return localizePath( path, locale, isLoggedIn );
			}
			return localizePath( path, providerLocale, isLoggedIn );
		},
		[ providerLocale ]
	);
}

export const withLocalizePath = createHigherOrderComponent(
	< OuterProps, >(
		InnerComponent: ComponentType<
			OuterProps & { localizePath: ReturnType< typeof useLocalizePath > }
		>
	) => {
		return ( props: OuterProps ) => {
			const localizePath = useLocalizePath();
			const innerProps = { ...props, localizePath };
			return <InnerComponent { ...innerProps } />;
		};
	},
	'withLocalizePath'
);
