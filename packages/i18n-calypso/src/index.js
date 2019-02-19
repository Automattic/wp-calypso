/** @format */

/**
 * Internal dependencies
 */
import I18N from './i18n';
import localizeFactory from './localize';

const i18n = new I18N();
export { I18N };
export default i18n;
export const moment = i18n.moment;
export const numberFormat = i18n.numberFormat.bind( i18n );
export const translate = i18n.translate.bind( i18n );
export const configure = i18n.configure.bind( i18n );
export const setLocale = i18n.setLocale.bind( i18n );
export const getLocale = i18n.getLocale.bind( i18n );
export const getLocaleSlug = i18n.getLocaleSlug.bind( i18n );
export const addTranslations = i18n.addTranslations.bind( i18n );
export const reRenderTranslations = i18n.reRenderTranslations.bind( i18n );
export const registerComponentUpdateHook = i18n.registerComponentUpdateHook.bind( i18n );
export const registerTranslateHook = i18n.registerTranslateHook.bind( i18n );
export const state = i18n.state;
export const stateObserver = i18n.stateObserver;
export const on = i18n.on.bind( i18n );
export const off = i18n.off.bind( i18n );
export const emit = i18n.emit.bind( i18n );
export const localize = localizeFactory( i18n );
