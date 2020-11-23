/**
 * External dependencies
 */
import * as React from 'react';
import { setLocaleData as setWpI18nLocaleData } from '@wordpress/i18n';
import { I18nProvider } from '@automattic/react-i18n';
import i18n from 'i18n-calypso';
import { LocaleProvider, i18nDefaultLocaleSlug } from '@automattic/i18n-utils';

const CalypsoI18nProvider: React.FunctionComponent = ( { children } ) => {
	const [ localeData, setLocaleData ] = React.useState( i18n.getLocale() );
	const localeSlug = i18n.getLocaleSlug();

	React.useEffect( () => {
		const onChange = () => {
			// Create a new object to ensure the provider sees the data has changed
			const nextLocaleData = Object.assign( {}, i18n.getLocale() );

			setWpI18nLocaleData( nextLocaleData );
			setLocaleData( nextLocaleData );
		};

		i18n.on( 'change', onChange );

		return () => {
			i18n.off( 'change', onChange );
		};
	}, [] );

	return (
		<LocaleProvider localeSlug={ localeSlug || config( 'i18n_default_locale_slug' ) }>
			<I18nProvider localeData={ localeData }>{ children }</I18nProvider>
		</LocaleProvider>
	);
};

export default CalypsoI18nProvider;
