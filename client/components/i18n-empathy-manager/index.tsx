/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { createI18n } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import userFactory from 'calypso/lib/user';

const placeholderOriginalString = "I don't understand";

/**
 * Repeats and cuts the placeholder so it matches original string length
 *
 * @param   originalString  A string that will be used to measure the length
 * @param   placeholder     Placeholder string that will be repeated
 * @returns                 Placeholder repeat sequence that will match original string's length
 */
function encodeUntranslatedString(
	originalString: string,
	placeholder = placeholderOriginalString
): string {
	let output = placeholder;

	while ( output.length < originalString.length ) {
		output += ' ' + placeholder;
	}

	return output.substr( 0, originalString.length );
}

const I18nEmpathyManager: React.FunctionComponent = () => {
	const empathyModeI18n = React.useMemo( () => createI18n(), [] );
	const { __, localeData, hasTranslation, addFilter, removeFilter } = useI18n();
	const user = userFactory().get();
	const isEnabled = config.isEnabled( 'i18n/empathy-mode' ) && user.i18n_empathy_mode;

	React.useEffect( () => {
		if ( ! isEnabled ) {
			return;
		}

		const placeholder = __( "I don't understand" );

		if ( ! hasTranslation ) {
			return;
		}

		addFilter(
			'postTranslation',
			'calypso/i18n-empathy-mode',
			( translation: string, originalArgs: string[], fnName: '__' | '_n' | '_nx' | '_x' ) => {
				const [ singular ] = originalArgs;
				let context;

				if ( singular === placeholderOriginalString ) {
					return translation;
				}

				if ( fnName === '_x' ) {
					context = originalArgs[ 1 ];
				} else if ( fnName === '_nx' ) {
					context = originalArgs[ 3 ];
				}

				if ( hasTranslation( singular, context ) ) {
					const originalString: string = empathyModeI18n[ fnName ].call(
						empathyModeI18n,
						...originalArgs
					);
					return originalString;
				}

				return `👉 ${ encodeUntranslatedString( translation, placeholder ) }`;
			}
		);

		return () => {
			removeFilter( 'postTranslation', 'calypso/i18n-empathy-mode' );
		};
	}, [ localeData ] );

	return null;
};

export default I18nEmpathyManager;
