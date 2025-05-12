import { defaultI18n } from '@wordpress/i18n';
import { I18nProvider as WPI18nProvider } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { setupLocale } from 'calypso/boot/locale';
import switchLocale from 'calypso/lib/i18n-utils/switch-locale';
import { useAuth } from '../auth';
import './init';

export function I18nProvider( { children }: { children: React.ReactNode } ) {
	const { user } = useAuth();

	useEffect( () => {
		if ( ! user.localeSlug && ! user.localeVariant ) {
			return;
		}

		const locale = setupLocale( user );

		// The `switchLocale` function is normally called within the `setLocale` action. However,
		// since we don't have access to the Redux store in this context, we need to call it manually.
		if ( locale ) {
			switchLocale( locale );
		}
	}, [ user.localeSlug, user.localeVariant ] );

	return <WPI18nProvider i18n={ defaultI18n }>{ children }</WPI18nProvider>;
}
