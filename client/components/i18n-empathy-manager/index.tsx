/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';

const I18nEmpathyManager: React.FunctionComponent = () => {
	const {
		localeData,
		hasTranslation,
		registerTranslationHook,
		unregisterTranslationHook,
	} = useI18n();

	const emapthyModeTranslationHook = (
		_translation: string,
		originalArgs: ( string | number )[],
		fnName: string
	) => {
		const [ singular ] = originalArgs;
		let context;

		if ( fnName === '_x' ) {
			context = originalArgs[ 1 ];
		} else if ( fnName === '_nx' ) {
			context = originalArgs[ 3 ];
		}

		// @todo: should use `i18nEmpathyTranslate`, instead of singular
		// @todo2: shuold use dymanic placeholder for fallback
		return hasTranslation( singular, context ) ? singular : "👉 I don't Understand";
	};

	React.useEffect( () => {
		if ( registerTranslationHook && unregisterTranslationHook ) {
			registerTranslationHook( emapthyModeTranslationHook );

			return () => unregisterTranslationHook( emapthyModeTranslationHook );
		}
	}, [ localeData ] );

	return null;
};

export default I18nEmpathyManager;
