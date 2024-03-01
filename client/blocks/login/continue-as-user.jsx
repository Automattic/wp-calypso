import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import wpcom from 'calypso/lib/wp';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';

import './continue-as-user.scss';

// Validate redirect URL using the REST endpoint.
// Return validated URL in case of success, `null` in case of failure.
function useValidatedURL( redirectUrl ) {
	const [ url, setURL ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( false );

	useEffect( () => {
		if ( redirectUrl ) {
			setIsLoading( true );
			wpcom.req
				.get( '/me/validate-redirect', { redirect_url: redirectUrl } )
				.then( ( res ) => {
					setURL( res?.redirect_to );
					setIsLoading( false );
				} )
				.catch( () => {
					setURL( null );
					setIsLoading( false );
				} );
		}
	}, [ redirectUrl ] );

	return { url, loading: isLoading && !! redirectUrl };
}

function ContinueAsUser( {
	currentUser,
	redirectUrlFromQuery,
	onChangeAccount,
	redirectPath,
	isSignUpFlow,
	isWooOAuth2Client,
} ) {
	const translate = useTranslate();
	const { url: validatedRedirectUrlFromQuery, loading: validatingQueryURL } =
		useValidatedURL( redirectUrlFromQuery );

	const { url: validatedRedirectPath, loading: validatingPath } = useValidatedURL( redirectPath );

	const isLoading = validatingQueryURL || validatingPath;

	const userName = currentUser.display_name || currentUser.username;

	// Render ContinueAsUser straight away, even before validation.
	// This helps avoid jarring layout shifts. It's not ideal that the link URL changes transparently
	// like that, but it is better than the alternative, and in practice it should happen quicker than
	// the user can notice.

	const translationComponents = {
		br: <br />,
		link: (
			<button
				type="button"
				id="loginAsAnotherUser"
				className="continue-as-user__change-user-link"
				onClick={ onChangeAccount }
			/>
		),
	};

	const notYouText = isSignUpFlow
		? translate( 'Not you?{{br/}} Sign out or log in with {{link}}another account{{/link}}', {
				components: translationComponents,
				args: { userName },
				comment: 'Link to continue login as different user',
		  } )
		: translate( 'Not you?{{br/}}Log in with {{link}}another account{{/link}}', {
				components: translationComponents,
				args: { userName },
				comment: 'Link to continue login as different user',
		  } );

	const gravatarLink = (
		<a
			style={ { pointerEvents: isLoading ? 'none' : 'auto' } }
			href={ validatedRedirectUrlFromQuery || validatedRedirectPath || '/' }
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
	);

	if ( isWooOAuth2Client ) {
		return (
			<div className="continue-as-user">
				<div className="continue-as-user__user-info">
					{ gravatarLink }
					<div className="continue-as-user__not-you">
						<button
							type="button"
							id="loginAsAnotherUser"
							className="continue-as-user__change-user-link"
							onClick={ onChangeAccount }
						>
							{ translate( 'Sign in as a different user' ) }
						</button>
					</div>
				</div>
				<Button
					primary
					busy={ isLoading }
					className="continue-as-user__continue-button"
					href={ validatedRedirectUrlFromQuery || validatedRedirectPath || '/' }
				>
					{ `${ translate( 'Continue as', {
						context: 'Continue as an existing WordPress.com user',
					} ) } ${ userName }` }
				</Button>
			</div>
		);
	}

	return (
		<div className="continue-as-user">
			<div className="continue-as-user__user-info">
				{ gravatarLink }
				<Button
					busy={ isLoading }
					primary
					href={ validatedRedirectUrlFromQuery || validatedRedirectPath || '/' }
				>
					{ translate( 'Continue' ) }
				</Button>
			</div>
			<div className="continue-as-user__not-you">{ notYouText }</div>
		</div>
	);
}

export default connect( ( state ) => ( {
	currentUser: getCurrentUser( state ),
	redirectUrlFromQuery: get( getCurrentQueryArguments( state ), 'redirect_to', null ),
} ) )( ContinueAsUser );
