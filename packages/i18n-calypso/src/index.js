/**
 * Internal dependencies
 */
import I18N from './i18n';
import localizeFactory from './localize';
import translateHookFactory from './use-translate';
import rtlFactory from './rtl';

// Export the `I18N` class
export { I18N };

// Create a default instance of `I18N` and make it the module default export
const i18n = new I18N();
export default i18n;

// Export the default instance's properties and bound methods for convenience
// These should be deprecated eventually, exposing only the default `i18n` instance
export const numberFormat = i18n.numberFormat.bind( i18n );
export const translate = i18n.translate.bind( i18n );
export const configure = i18n.configure.bind( i18n );
export const setLocale = i18n.setLocale.bind( i18n );
export const getLocale = i18n.getLocale.bind( i18n );
export const getLocaleSlug = i18n.getLocaleSlug.bind( i18n );
export const getLocaleVariant = i18n.getLocaleVariant.bind( i18n );
export const isRtl = i18n.isRtl.bind( i18n );
export const addTranslations = i18n.addTranslations.bind( i18n );
export const reRenderTranslations = i18n.reRenderTranslations.bind( i18n );
export const registerComponentUpdateHook = i18n.registerComponentUpdateHook.bind( i18n );
export const registerTranslateHook = i18n.registerTranslateHook.bind( i18n );
export const state = i18n.state;
export const stateObserver = i18n.stateObserver;
export const on = i18n.on.bind( i18n );
export const off = i18n.off.bind( i18n );
export const emit = i18n.emit.bind( i18n );

// Export the React helpers bound to the default `i18n` instance
export const localize = localizeFactory( i18n );
export const useTranslate = translateHookFactory( i18n );
const { useRtl, withRtl } = rtlFactory( i18n );
export { useRtl, withRtl };
