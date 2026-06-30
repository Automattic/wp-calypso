import config from '@automattic/calypso-config';
import { useCallback, useState } from 'react';
import BlackboxChallenge from 'calypso/blocks/login/blackbox-challenge';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import { resetBlackbox } from 'calypso/blocks/login/utils/use-blackbox';

const noopGetSessionId = () => Promise.resolve( undefined );

/**
 * Wire Blackbox into a form. Returns the four pieces a protected form needs:
 *
 * - `challenge`: the challenge container element to render in the form.
 * - `isSubmitBlocked`: fold into the submit button's `disabled` prop.
 * - `getSessionId`: await at submit time to attach `blackbox_session_id` to the
 *   request payload.
 * - `reset` — call on a failed request so the retry gets a fresh session.
 * @param {Object} options
 * @param {string} options.feature Feature flag gating Blackbox for this surface.
 *   Form is only protected when this flag is enabled and a `blackbox_api_key` is
 *   configured. When disabled, `getSessionId` is a no-op so no SDK load/collect happens.
 * @returns {{
 *   isSubmitBlocked: boolean,
 *   challenge: import('react').ReactElement,
 *   getSessionId: () => Promise<string|undefined>,
 *   reset: () => void,
 * }}
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
		reset: resetBlackbox,
	};
}
