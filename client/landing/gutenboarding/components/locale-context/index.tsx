/**
 * External dependencies
 */
import * as React from 'react';
import { getLanguageFile } from '../../../../lib/i18n-utils/switch-locale';
import { I18nProvider } from '@automattic/react-i18n';
import { setLocaleData, LocaleData } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import config from '../../../../config';

const DEFAULT_LOCALE_SLUG: string = config( 'i18n_default_locale_slug' );

export type ChangeLocaleFunction = ( newLocale: string ) => void;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const ChangeLocaleContext = React.createContext< ChangeLocaleFunction >( () => {} );

export const ChangeLocaleContextConsumer = ChangeLocaleContext.Consumer;

type Props = {
	initialLocaleData: LocaleData | undefined;
};

export const LocaleContext: React.FunctionComponent< Props > = ( {
	children,
	initialLocaleData,
} ) => {
	const [ localeData, setLocale ] = React.useState( initialLocaleData );

	const changeLocale = async ( newLocale: string ) => {
		if ( newLocale === DEFAULT_LOCALE_SLUG ) {
			setLocale( undefined );
		}
		try {
			const newLocaleData = await getLanguageFile( newLocale );
			setLocale( newLocaleData );
		} catch {}
	};

	React.useEffect( () => {
		setLocaleData( localeData );
	}, [ localeData ] );

	return (
		<ChangeLocaleContext.Provider value={ changeLocale }>
			<I18nProvider initialLocaleData={ initialLocaleData }>{ children }</I18nProvider>
		</ChangeLocaleContext.Provider>
	);
};
