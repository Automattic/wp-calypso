import defaultCalypsoI18n from 'i18n-calypso';
import { useEffect } from 'react';
import { setupLocale } from 'calypso/boot/locale';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import switchLocale from 'calypso/lib/i18n-utils/switch-locale';
import { useAuth } from '../auth';

export function I18nProvider( { children }: { children: React.ReactNode } ) {
	const { user } = useAuth();

	useEffect( () => {
		if ( ! user.language ) {
			return;
		}

		const locale = setupLocale( user );

		// The `switchLocale` function is normally called within the `setLocale` action. However,
		// since we don't have access to the Redux store in this context, we need to call it manually.
		if ( locale ) {
			switchLocale( locale );
		}
	}, [ user.language ] );

	return <CalypsoI18nProvider i18n={ defaultCalypsoI18n }>{ children }</CalypsoI18nProvider>;
}
