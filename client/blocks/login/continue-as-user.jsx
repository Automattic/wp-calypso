/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { parse as qsParse } from 'qs';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { getCurrentUser } from 'state/current-user/selectors';
import Gravatar from 'components/gravatar';

/**
 * Style dependencies
 */
import './continue-as-user.scss';

function ContinueAsUser( { currentUser } ) {
	const translate = useTranslate();
	const [ validated, setValidated ] = useState( null );

	useEffect( () => {
		async function runEffect() {
			if ( ! currentUser ) {
				return null;
			}

			// TODO (sgomes): Replace with URLSearchParams when polyfilled (see #35408).
			// const query = new URLSearchParams( window.location.search );
			// const redirectUrl = query.get( 'redirect_to' );
			const query = qsParse( window.location.search, { ignoreQueryPrefix: true } );
			const redirectUrl = query.redirect_to;
			if ( ! redirectUrl ) {
				return;
			}

			try {
				const response = await wpcom.req.get(
					`/me/validate-redirect?redirect_url=${ redirectUrl }`
				);
				if ( response ) {
					setValidated( response.redirect_to || '/' );
				}
			} catch {
				// Ignore error, set the redirect link as a default `/`.
				setValidated( '/' );
			}
		}

		runEffect();
	}, [ currentUser ] );

	if ( ! currentUser ) {
		return null;
	}

	const userName = currentUser.display_name || currentUser.username;

	// Render ContinueAsUser straight away, even before validation.
	// This helps avoid jarring layout shifts. It's not ideal that the link URL changes transparently
	// like that, but it is better than the alternative, and in practice it should happen quicker than
	// the user can notice.
	const redirectLink = (
		<a href={ validated || '/' }>
			<Gravatar user={ currentUser } size={ 16 } />
			{ userName }
		</a>
	);

	return (
		<div className="continue-as-user">
			{ translate( 'or continue as {{userName/}}', {
				components: { userName: redirectLink },
				comment: 'Alternative link under login header, skips login to continue as current user.',
			} ) }
		</div>
	);
}

export default connect( state => ( {
	currentUser: getCurrentUser( state ),
} ) )( ContinueAsUser );
