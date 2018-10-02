/** @format */
/**
 * Internal dependencies
 */
import I18N from './lib';
import makeLocalize from './lib/localize';

const i18n = new I18N();

const exported = {
	moment: i18n.moment,
	numberFormat: i18n.numberFormat.bind( i18n ),
	translate: i18n.translate.bind( i18n ),
	configure: i18n.configure.bind( i18n ),
	setLocale: i18n.setLocale.bind( i18n ),
	getLocale: i18n.getLocale.bind( i18n ),
	getLocaleSlug: i18n.getLocaleSlug.bind( i18n ),
	addTranslations: i18n.addTranslations.bind( i18n ),
	reRenderTranslations: i18n.reRenderTranslations.bind( i18n ),
	registerComponentUpdateHook: i18n.registerComponentUpdateHook.bind( i18n ),
	registerTranslateHook: i18n.registerTranslateHook.bind( i18n ),
	state: i18n.state,
	stateObserver: i18n.stateObserver,
	on: i18n.stateObserver.on.bind( i18n.stateObserver ),
	off: i18n.stateObserver.removeListener.bind( i18n.stateObserver ),
	emit: i18n.stateObserver.emit.bind( i18n.stateObserver ),
	localize: makeLocalize( i18n ),
	$this: i18n,
	I18N: I18N,
};

export default exported;
export { i18n as $this, I18N };

export const {
	moment,
	numberFormat,
	translate,
	configure,
	setLocale,
	getLocale,
	getLocaleSlug,
	addTranslations,
	reRenderTranslations,
	registerComponentUpdateHook,
	registerTranslateHook,
	state,
	stateObserver,
	on,
	off,
	emit,
	localize,
} = exported;
