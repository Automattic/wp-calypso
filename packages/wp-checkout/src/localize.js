/* @format */

/**
 * External dependencies
 */
import { useContext } from 'react';

/**
 * Internal dependencies
 */
import { CheckoutContext } from './checkout-context';

export default function localizeFactory( locale ) {
	return text => {
		// TODO
		return text;
	};
}

export function useLocalize() {
	const { localize } = useContext( CheckoutContext );
	return localize;
}
