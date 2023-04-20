import { getLocaleData } from '@wordpress/i18n';
import { addTranslations } from 'i18n-calypso';
import { useEffect } from 'react';

/**
 * Load translation data from @wordpress/i18n into i18n-calypso, in order to
 * provide translations to external components that use the latter library.
 */
export default function useI18nCalypsoTranslations() {
	useEffect( () => {
		addTranslations( getLocaleData( 'happy-blocks' ) );
	}, [] );
}
