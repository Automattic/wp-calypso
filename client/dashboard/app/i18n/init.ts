import { getLocaleData, hasTranslation, setLocaleData, subscribe } from '@wordpress/i18n';
import { setI18n } from 'calypso/lib/i18n-utils/i18n';

const noop = () => {};

const unsubscribes = new Map< () => unknown, () => unknown >();

const i18n = {
	addTranslations: ( localeData: Record< string, unknown > ) => {
		setLocaleData( localeData );
	},
	configure: noop,
	emit: noop,
	getLocaleSlug: () => getLocaleData()?.[ '' ]?.localeSlug,
	getLocaleVariant: () => getLocaleData()?.[ '' ]?.localeVariant,
	hasTranslation,
	off: ( callback: () => void ) => {
		const unsubscribe = unsubscribes.get( callback );
		if ( unsubscribe ) {
			unsubscribe();
			unsubscribes.delete( callback );
		}
	},
	on: ( callback: () => void ) => {
		unsubscribes.set( callback, subscribe( callback ) );
	},
	registerTranslateHook: noop,
	reRenderTranslations: noop,
	setLocale: ( localeData: Record< string, unknown > ) => {
		setLocaleData( localeData );
	},
};

setI18n( i18n );
