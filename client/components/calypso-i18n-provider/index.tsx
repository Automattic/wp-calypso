import { LocaleProvider, i18nDefaultLocaleSlug, isDefaultLocale } from '@automattic/i18n-utils';
import { defaultI18n } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';
import defaultCalypsoI18n, { I18NContext } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import type { I18N } from 'i18n-calypso';
import type { FunctionComponent } from 'react';

const CalypsoI18nProvider: FunctionComponent< { i18n?: I18N; children?: React.ReactNode } > = ( {
	i18n = defaultCalypsoI18n,
	children,
} ) => {
	const [ localeSlug, setLocaleSlug ] = useState( i18n.getLocaleSlug() );

	useEffect( () => {
		const onChange = () => {
			console.log( 'ON CHANGE!!!! ' + i18n.getLocaleSlug() );
			if ( isDefaultLocale( i18n.getLocaleSlug() ) ) {
				console.log( 'CHANGE A' );
				defaultI18n.resetLocaleData();
			} else {
				console.log( 'CHANGE B' );
				defaultI18n.setLocaleData( i18n.getLocale() );
			}
			setLocaleSlug( i18n.getLocaleSlug() );

			console.log( { defaultI18n: defaultI18n.getLocaleData() } );
		};

		i18n.on( 'change', onChange );

		return () => {
			i18n.off( 'change', onChange );
		};
	}, [ i18n ] );

	useEffect( () => {
		console.log( 'ON RESET!!!! ' + i18n.getLocaleSlug() );
		if ( isDefaultLocale( localeSlug ) ) {
			console.log( 'RESET A' );
			defaultI18n.resetLocaleData();
		} else {
			console.log( 'RESET B' );
			defaultI18n.resetLocaleData( i18n.getLocale() );
		}
		console.log( { defaultI18n: defaultI18n.getLocaleData() } );
	}, [ localeSlug ] );

	return (
		<I18NContext.Provider value={ i18n }>
			<LocaleProvider localeSlug={ localeSlug || i18nDefaultLocaleSlug }>
				<I18nProvider i18n={ defaultI18n }>{ children }</I18nProvider>
			</LocaleProvider>
		</I18NContext.Provider>
	);
};

export default CalypsoI18nProvider;
