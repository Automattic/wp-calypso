/**
 * External dependencies
 */
import * as React from 'react';
import { defaultI18n } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { LocaleProvider, i18nDefaultLocaleSlug } from '@automattic/i18n-utils';

const CalypsoI18nProvider: React.FunctionComponent = ( { children } ) => {
	const [ localeSlug, setLocaleSlug ] = React.useState( i18n.getLocaleSlug() );

	React.useEffect( () => {
		const onChange = () => {
			defaultI18n.setLocaleData( i18n.getLocale() );
			setLocaleSlug( i18n.getLocaleSlug() );
		};

		i18n.on( 'change', onChange );

		return () => {
			i18n.off( 'change', onChange );
		};
	}, [] );

	React.useEffect( () => {
		defaultI18n.resetLocaleData( i18n.getLocale() );
	}, [ localeSlug ] );

	return (
		<LocaleProvider localeSlug={ localeSlug || i18nDefaultLocaleSlug }>
			<I18nProvider i18n={ defaultI18n }>{ children }</I18nProvider>
		</LocaleProvider>
	);
};

export default CalypsoI18nProvider;
