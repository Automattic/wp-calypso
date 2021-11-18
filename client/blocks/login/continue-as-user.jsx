import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import wpcom from 'calypso/lib/wp';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';

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

function ContinueAsUser( { currentUser, redirectUrlFromQuery, onChangeAccount, redirectPath } ) {
	const translate = useTranslate();
	const [ validatedRedirectUrl, setValidatedRedirectUrl ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		validateUrl( redirectUrlFromQuery ).then( ( maybeValidatedUrl ) => {
			setValidatedRedirectUrl( maybeValidatedUrl );
			setIsLoading( false );
		} );
	}, [ redirectUrlFromQuery ] );

	const userName = currentUser.display_name || currentUser.username;

	// Render ContinueAsUser straight away, even before validation.
	// This helps avoid jarring layout shifts. It's not ideal that the link URL changes transparently
	// like that, but it is better than the alternative, and in practice it should happen quicker than
	// the user can notice.

	return (
		<div className="continue-as-user">
			<div className="continue-as-user__user-info">
				<a
					style={ { pointerEvents: isLoading ? 'none' : 'auto' } }
					href={ validatedRedirectUrl || redirectPath || '/' }
					className="continue-as-user__gravatar-link"
				>
					<Gravatar
						user={ currentUser }
						className="continue-as-user__gravatar"
						imgSize={ 400 }
						size={ 110 }
					/>
					<div className="continue-as-user__username">{ userName }</div>
					<div className="continue-as-user__email">{ currentUser.email }</div>
				</a>
				<Button busy={ isLoading } primary href={ validatedRedirectUrl || redirectPath || '/' }>
					{ translate( 'Continue' ) }
				</Button>
			</div>
			<div className="continue-as-user__not-you">
				{ translate( 'Not you?{{br/}}Log in with {{link}}another account{{/link}}', {
					components: {
						br: <br />,
						link: (
							<button
								type="button"
								id="loginAsAnotherUser"
								className="continue-as-user__change-user-link"
								onClick={ onChangeAccount }
							/>
						),
					},
					args: { userName },
					comment: 'Link to continue login as different user',
				} ) }
			</div>
		</div>
	);
}

export default connect( ( state ) => ( {
	currentUser: getCurrentUser( state ),
	redirectUrlFromQuery: get( getCurrentQueryArguments( state ), 'redirect_to', null ),
} ) )( ContinueAsUser );
