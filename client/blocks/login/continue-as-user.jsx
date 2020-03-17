/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { getCurrentUser } from 'state/current-user/selectors';
import { getCurrentQueryArguments } from 'state/selectors/get-current-query-arguments';
import Gravatar from 'components/gravatar';

/**
 * Style dependencies
 */
import './continue-as-user.scss';

// Validate redirect URL using the REST endpoint.
// Return validated URL in case of success, `null` in case of failure.
async function validateUrl( redirectUrl ) {
	if ( ! redirectUrl ) {
		return null;
	}

	try {
		const response = await wpcom.req.get( '/me/validate-redirect', { redirect_url: redirectUrl } );

		if ( ! response || ! response.redirect_to ) {
			return null;
		}

		return response.redirect_to;
	} catch {
		// Ignore error, let the redirect link default to `/`.
		return null;
	}
}

function ContinueAsUser( { currentUser, redirectUrlFromQuery, onChangeAccount } ) {
	const translate = useTranslate();
	const [ validatedRedirectUrl, setValidatedRedirectUrl ] = useState( null );

	useEffect( () => {
		validateUrl( redirectUrlFromQuery ).then( setValidatedRedirectUrl );
	}, [ redirectUrlFromQuery ] );

	const userName = currentUser.display_name || currentUser.username;

	// Render ContinueAsUser straight away, even before validation.
	// This helps avoid jarring layout shifts. It's not ideal that the link URL changes transparently
	// like that, but it is better than the alternative, and in practice it should happen quicker than
	// the user can notice.

	return (
		<div className="continue-as-user">
			<Gravatar user={ currentUser } imgSize={ 400 } size={ 200 } />
			<Button primary href={ validatedRedirectUrl || '/' }>
				{ translate( 'Continue as %(userName)s', { args: { userName } } ) }
			</Button>
			<p>
				{ translate( 'Not %(userName)s? Log in with {{link}}another account{{/link}}', {
					components: {
						link: (
							<button
								type="button"
								className="continue-as-user__change-user-link"
								onClick={ onChangeAccount }
							/>
						),
					},
					args: { userName },
					comment: 'Link to continue login as different user',
				} ) }
			</p>
		</div>
	);
}

export default connect( state => ( {
	currentUser: getCurrentUser( state ),
	redirectUrlFromQuery: get( getCurrentQueryArguments( state ), 'redirect_to', null ),
} ) )( ContinueAsUser );
