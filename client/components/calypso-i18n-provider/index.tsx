import { LocaleProvider, i18nDefaultLocaleSlug } from '@automattic/i18n-utils';
import { setLocale as setLocaleNumberFormatters } from '@automattic/number-formatters';
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
			defaultI18n.setLocaleData( i18n.getLocale() );
			setLocaleSlug( i18n.getLocaleSlug() );
		};

		return i18n.subscribe( onChange );
	}, [ i18n ] );

	useEffect( () => {
		defaultI18n.resetLocaleData( i18n.getLocale() );

		if ( localeSlug ) {
			// Propagate the locale to @automattic/number-formatters
			setLocaleNumberFormatters( localeSlug );
		}
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
