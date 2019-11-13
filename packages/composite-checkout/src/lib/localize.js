/**
 * External dependencies
 */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { __, setLocaleData } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import LocalizeContext from './localize-context';

export default function localizeFactory( locale ) {
	setLocaleData( {
		locale_data: {
			messages: {
				'': { domain: 'messages', lang: locale, plural_forms: 'nplurals=2; plural=(n != 1);' },
			},
		},
	} );
	return __;
}

export function useLocalize() {
	const localize = useContext( LocalizeContext );
	if ( typeof localize !== 'function' ) {
		throw new Error( 'useLocalize can only be used inside a CheckoutProvider' );
	}
	return localize;
}

export function LocalizeProvider( { locale, children } ) {
	if ( ! locale ) {
		throw new Error( 'LocalizeProvider requires locale' );
	}
	const localize = localizeFactory( locale );
	return <LocalizeContext.Provider value={ localize }>{ children }</LocalizeContext.Provider>;
}

LocalizeProvider.propTypes = {
	locale: PropTypes.string.isRequired,
};
