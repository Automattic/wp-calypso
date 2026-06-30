import config from '@automattic/calypso-config';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import BlackboxChallenge from 'calypso/blocks/login/blackbox-challenge';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';

const noopGetSessionId = () => Promise.resolve( undefined );

/**
 * @typedef {Object} BlackboxProtection
 * @property {boolean} isSubmitBlocked Whether the submit button should be disabled.
 * @property {import('react').ReactElement} challenge Challenge container element to render in the form.
 * @property {() => Promise<string|undefined>} getSessionId Resolves the Blackbox session ID (no-op when disabled).
 * @property {() => void} reset Resets the Blackbox session so a retry starts fresh.
 */

export const blackboxProtectionPropType = PropTypes.shape( {
	isSubmitBlocked: PropTypes.bool.isRequired,
	challenge: PropTypes.node.isRequired,
	getSessionId: PropTypes.func.isRequired,
	reset: PropTypes.func.isRequired,
} ).isRequired;

/**
 * Wire Blackbox into a form
 * @param {Object} options
 * @param {string} options.feature Feature flag gating Blackbox for this surface.
 *   Form is only protected when this flag is enabled and a `blackbox_api_key` is
 *   configured. When disabled, `getSessionId` is a no-op so no SDK load/collect happens.
 * @returns {BlackboxProtection}
 */
export function useBlackboxProtection( { feature } ) {
	const enabled =
		!! config( 'blackbox_api_key' ) &&
		config.isEnabled( 'blackbox' ) &&
		config.isEnabled( feature );
	const [ isSubmitBlocked, setIsSubmitBlocked ] = useState( enabled );

	const handleSubmitBlockedChange = useCallback( ( isBlocked ) => {
		setIsSubmitBlocked( isBlocked );
	}, [] );

	return {
		isSubmitBlocked,
		challenge: (
			<BlackboxChallenge enabled={ enabled } onSubmitBlockedChange={ handleSubmitBlockedChange } />
		),
		getSessionId: enabled ? getBlackboxSessionId : noopGetSessionId,
		reset: () => {
			try {
				window.Blackbox?.reset();
			} catch {
				// Intentionally ignored — Blackbox must never block the host form.
			}
		},
	};
}
