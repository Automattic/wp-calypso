/**
 * External dependencies
 */
import { useContext } from 'react';

/**
 * Internal dependencies
 */
import CheckoutContext from './checkout-context';

// TODO: we need to implement this; probably delegated to i18n-calypso
/* eslint-disable no-unused-vars */
export default function localizeFactory( locale ) {
	return text => {
		return text;
	};
}
/* eslint-enable no-unused-vars */

export function useLocalize() {
	const { localize } = useContext( CheckoutContext );
	if ( ! localize ) {
		throw new Error( 'useLocalize can only be used inside a CheckoutProvider' );
	}
	return localize;
}
