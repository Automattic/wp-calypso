import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import wpcom from 'calypso/lib/wp';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWooPasswordless from 'calypso/state/selectors/get-is-woo-passwordless';
import SocialToS from '../authentication/social/social-tos';

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
	isWooOAuth2Client,
	isWooPasswordless,
	isBlazePro,
	notYouText,
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

	const notYouDisplayedText = notYouText
		? notYouText
		: translate( 'Not you?{{br/}}Log in with {{link}}another account{{/link}}', {
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
		  } );

	const gravatarLink = (
		<div className="continue-as-user__gravatar-content">
			<Gravatar
				user={ currentUser }
				className="continue-as-user__gravatar"
				imgSize={ 400 }
				size={ 110 }
			/>
			<div className="continue-as-user__username">{ userName }</div>
			<div className="continue-as-user__email">{ currentUser.email }</div>
		</div>
	);

	if ( isWooOAuth2Client ) {
		if ( isWooPasswordless ) {
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
					<div className="continue-as-user__not-you">
						<button
							type="button"
							id="loginAsAnotherUser"
							className="continue-as-user__change-user-link"
							onClick={ onChangeAccount }
						>
							{ translate( 'Log in with a different WordPress.com account' ) }
						</button>
					</div>
					<Button
						busy={ isLoading }
						primary
						href={ validatedRedirectUrlFromQuery || validatedRedirectPath || '/' }
					>
						{ `${ translate( 'Continue as', {
							context: 'Continue as an existing WordPress.com user',
						} ) } ${ userName }` }
					</Button>
				</div>
			</div>
		);
	}

	if ( isBlazePro ) {
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
				<SocialToS />
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
					href={ validatedRedirectPath || validatedRedirectUrlFromQuery || '/' }
				>
					{ translate( 'Continue' ) }
				</Button>
			</div>
			<div className="continue-as-user__not-you">{ notYouDisplayedText }</div>
		</div>
	);
}

export default connect( ( state ) => ( {
	currentUser: getCurrentUser( state ),
	redirectUrlFromQuery: get( getCurrentQueryArguments( state ), 'redirect_to', null ),
	isWooPasswordless: getIsWooPasswordless( state ),
	isBlazePro: getIsBlazePro( state ),
} ) )( ContinueAsUser );
