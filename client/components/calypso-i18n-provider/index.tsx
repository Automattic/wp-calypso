/**
 * External dependencies
 */
import * as React from 'react';
import { createI18n, setLocaleData as setWpI18nLocaleData } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { LocaleProvider, i18nDefaultLocaleSlug } from '@automattic/i18n-utils';

const CalypsoI18nProvider: React.FunctionComponent = ( { children } ) => {
	const [ localeSlug, setLocaleSlug ] = React.useState( i18n.getLocaleSlug() );
	const wpI18n = React.useMemo( () => createI18n( i18n.getLocale() ), [ localeSlug ] );

	React.useEffect( () => {
		const onChange = () => {
			// Create a new object to ensure the provider sees the data has changed
			const nextLocaleData = Object.assign( {}, i18n.getLocale() );

			setWpI18nLocaleData( nextLocaleData );
			wpI18n.setLocaleData( nextLocaleData );
			setLocaleSlug( i18n.getLocaleSlug() );
		};

		i18n.on( 'change', onChange );

		return () => {
			i18n.off( 'change', onChange );
		};
	}, [ localeSlug ] );

	return (
		<LocaleProvider localeSlug={ localeSlug || i18nDefaultLocaleSlug }>
			<I18nProvider i18n={ wpI18n }>{ children }</I18nProvider>
		</LocaleProvider>
	);
};

export default CalypsoI18nProvider;
