/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { setLocaleData as setWpI18nLocaleData } from '@wordpress/i18n';
import { I18nProvider } from '@automattic/react-i18n';
import i18n from 'i18n-calypso';

const CalypsoI18nProvider: React.FunctionComponent = ( { children } ) => {
	const [ localeData, setLocaleData ] = React.useState( i18n.state.locale );

	useEffect( () => {
		const onChange = () => {
			const nextLocaleData = i18n.state.locale;
			setLocaleData( nextLocaleData );
		};

		i18n.on( 'change', onChange );
		return () => {
			i18n.off( 'change', onChange );
		};
	}, [] );

	useEffect( () => {
		setWpI18nLocaleData( localeData );
	}, [ localeData ] );

	return <I18nProvider localeData={ localeData }>{ children }</I18nProvider>;
};

export default CalypsoI18nProvider;