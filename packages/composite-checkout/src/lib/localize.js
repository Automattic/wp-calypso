/**
 * External dependencies
 */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import LocalizeContext from './localize-context';

// TODO: we need to implement this; probably delegated to i18n-calypso
/* eslint-disable no-unused-vars */
export default function localizeFactory( locale ) {
	return text => {
		return text;
	};
}
/* eslint-enable no-unused-vars */

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
