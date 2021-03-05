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
	const [ localeSlug, setLocaleSlug ] = React.useState( i18n.getLocaleSlug() );

	React.useEffect( () => {
		const onChange = () => {
			// Create a new object to ensure the provider sees the data has changed
			const nextLocaleData = Object.assign( {}, i18n.getLocale() );

			setWpI18nLocaleData( nextLocaleData );
			setLocaleData( nextLocaleData );
			setLocaleSlug( i18n.getLocaleSlug() );
		};

		i18n.on( 'change', onChange );

		return () => {
			i18n.off( 'change', onChange );
		};
	}, [] );

	return (
		<LocaleProvider localeSlug={ localeSlug || i18nDefaultLocaleSlug }>
			<I18nProvider localeData={ localeData }>{ children }</I18nProvider>
		</LocaleProvider>
	);
};

export default CalypsoI18nProvider;
