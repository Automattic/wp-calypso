import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import Gravatar from 'calypso/components/gravatar';
import wpcom from 'calypso/lib/wp';
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

export default function ContinueAsUser( {
	currentUser,
	onChangeAccount,
	redirectPath,
	isWoo,
	isBlazePro,
} ) {
	const translate = useTranslate();

	const { url: validatedPath, loading: validatingPath } = useValidatedURL( redirectPath );

	const userName = currentUser.display_name || currentUser.username;

	// Render ContinueAsUser straight away, even before validation.
	// This helps avoid jarring layout shifts. It's not ideal that the link URL changes transparently
	// like that, but it is better than the alternative, and in practice it should happen quicker than
	// the user can notice.

	const notYouText = translate( 'Not you?{{br/}}Log in with {{link}}another account{{/link}}', {
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

	if ( isWoo ) {
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
					className="continue-as-user__continue-button"
					busy={ validatingPath }
					href={ validatedPath || '/' }
				>
					{ translate( 'Continue' ) }
				</Button>
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
					className="continue-as-user__continue-button"
					busy={ validatingPath }
					href={ validatedPath || '/' }
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
				<Button primary busy={ validatingPath } href={ validatedPath || '/' }>
					{ translate( 'Continue' ) }
				</Button>
			</div>
			<div className="continue-as-user__not-you">{ notYouText }</div>
		</div>
	);
}
