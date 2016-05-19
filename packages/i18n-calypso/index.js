/**
 * Internal dependencies
 */
var i18n = require( './lib' ),
	mixin = require( './lib/mixin' ),
	localize = require( './lib/localize' );

module.exports = {
	moment: i18n.moment,
	numberFormat: i18n.numberFormat.bind( i18n ),
	translate: i18n.translate.bind( i18n ),
	configure: i18n.configure.bind( i18n ),
	setLocale: i18n.setLocale.bind( i18n ),
	getLocale: i18n.getLocale.bind( i18n ),
	getLocaleSlug: i18n.getLocaleSlug.bind( i18n ),
	reRenderTranslations: i18n.reRenderTranslations.bind( i18n ),
	registerComponentUpdateHook: i18n.registerComponentUpdateHook.bind( i18n ),
	registerTranslateHook: i18n.registerTranslateHook.bind( i18n ),
	mixin: mixin,
	localize: localize,
	state: i18n.state,
	stateObserver: i18n.stateObserver,
	on: i18n.stateObserver.on.bind(i18n.stateObserver),
	I18N: i18n.I18N
};

