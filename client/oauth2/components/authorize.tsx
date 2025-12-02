import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import {
	Icon,
	commentAuthorAvatar,
	postList,
	create,
	tag,
	comment,
	bell,
	chartBar,
	media,
	addSubmenu,
} from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Gravatar from 'calypso/components/gravatar';
import { useLoginContext } from 'calypso/login/login-context';
import OneLoginLayout from 'calypso/login/wp-login/components/one-login-layout';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import useAuthorizeMeta from '../hooks/use-authorize-meta';

function Authorize() {
	const params = Object.fromEntries( new URLSearchParams( window.location.search ) ) as Record<
		string,
		string
	>;
	const { data: meta, isLoading, error } = useAuthorizeMeta( { params } );
	const { setHeaders } = useLoginContext();
	const translate = useTranslate();
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const [ showSuccessMessage, setShowSuccessMessage ] = useState( false );

	useEffect( () => {
		if ( ! oauth2Client ) {
			return;
		}

		setHeaders( {
			heading: translate( 'Connect {{span}}%(client)s{{/span}}', {
				args: { client: oauth2Client.name },
				components: { span: <span className="wp-login__one-login-header-client-name" /> },
			} ),
			subHeading: translate(
				'Give {{span}}%(client)s{{/span}} access to your WordPress.com account',
				{
					args: { client: oauth2Client.name },
					components: { span: <span className="wp-login__one-login-header-client-name" /> },
				}
			),
			subHeadingSecondary: null,
		} );
	}, [ oauth2Client, setHeaders, translate ] );

	useEffect( () => {
		if ( ! meta ) {
			return;
		}
		if ( ! meta.flags.user_logged_in && meta.links?.calypso_login_url ) {
			//window.location.replace( meta.links.calypso_login_url );
		}
	}, [ meta ] );

	const onApprove = () => {
		if ( ! meta ) {
			return;
		}

		// Check if this is a custom protocol (like wpcom-local-dev:// for Studio)
		const params = new URLSearchParams( window.location.search );
		const redirectUri = params.get( 'redirect_uri' ) || '';
		const isCustomProtocol = redirectUri && ! redirectUri.startsWith( 'http' );

		// Build the authorize URL with nonce
		const authorizeUrl = new URL( meta.links.authorize, window.location.origin );
		const redirectToUrl = new URL( meta.links.redirect_to, window.location.origin );

		// Copy all parameters from redirect_to to authorize URL
		redirectToUrl.searchParams.forEach( ( value, key ) => {
			authorizeUrl.searchParams.set( key, value );
		} );

		// Ensure blog_id is set (required by backend, use 0 for WordPress.com Connect)
		if ( ! authorizeUrl.searchParams.has( 'blog_id' ) ) {
			authorizeUrl.searchParams.set( 'blog_id', '0' );
		}

		// Add the nonce
		if ( meta.nonce?._wpnonce ) {
			authorizeUrl.searchParams.set( '_wpnonce', meta.nonce._wpnonce );
		}

		// Redirect via GET (standard OAuth2 flow for logged-in users)
		window.location.href = authorizeUrl.toString();

		// For custom protocol, show success message after redirect starts
		if ( isCustomProtocol ) {
			setTimeout( () => {
				setShowSuccessMessage( true );
			}, 500 );
		}
	};

	const onDeny = () => {
		if ( ! meta ) {
			return;
		}
		// Decode HTML entities in the deny URL (backend may return &amp; instead of &)
		const textarea = document.createElement( 'textarea' );
		textarea.innerHTML = meta.links.deny;
		const decodedUrl = textarea.value;

		window.location.href = decodedUrl;
	};

	const onSwitch = () => {
		if ( ! meta ) {
			return;
		}
		window.location.href = meta.links.logout;
	};

	// Map permission names to icons
	const getPermissionIcon = ( permissionName: string ) => {
		const iconMap: Record< string, typeof commentAuthorAvatar > = {
			users: commentAuthorAvatar,
			posts: postList,
			follow: create,
			taxonomy: tag,
			comments: comment,
			notifications: bell,
			stats: chartBar,
			media: media,
			menus: addSubmenu,
		};
		return iconMap[ permissionName ];
	};

	let content = null;
	if ( isLoading || ! meta ) {
		content = <div className="oauth2-connect__loading">{ translate( 'Loading…' ) }</div>;
	}

	if ( error ) {
		content = <div className="oauth2-connect__error">{ error.message }</div>;
	}

	if ( meta ) {
		content = (
			<div className="oauth2-connect">
				{ meta.user && (
					<>
						<div className="oauth2-connect__user-card">
							<Gravatar
								user={ meta.user }
								size={ 72 }
								imgSize={ 144 }
								className="oauth2-connect__user-avatar"
							/>
							<div className="oauth2-connect__user-info">
								<div className="oauth2-connect__user-name">{ meta.user.display_name }</div>
								<div className="oauth2-connect__user-details">
									{ meta.user.username && meta.user.site_count !== undefined
										? translate(
												'%(username)s - %(count)d site',
												'%(username)s - %(count)d sites',
												{
													count: meta.user.site_count,
													args: {
														username: meta.user.username,
														count: meta.user.site_count,
													},
												}
										  )
										: meta.user.email }
								</div>
							</div>
						</div>
						<div className="oauth2-connect__switch-account-link">
							<Button
								variant="link"
								onClick={ onSwitch }
								className="oauth2-connect__switch-account"
							>
								{ translate( 'Log in with a different account' ) }
							</Button>
						</div>
					</>
				) }

				<div className="oauth2-connect__permissions">
					<p className="oauth2-connect__permissions-heading">
						{ translate( '%(client)s is requesting access to:', {
							args: { client: meta.client.title },
						} ) }
					</p>
					<div className="oauth2-connect__permissions-grid">
						{ meta.permissions.map( ( permission ) => {
							const icon = getPermissionIcon( permission.name );
							return (
								<div key={ permission.name } className="oauth2-connect__permission-item">
									{ icon && <Icon icon={ icon } size={ 20 } /> }
									<span>{ permission.description }</span>
								</div>
							);
						} ) }
					</div>
				</div>

				<div className="oauth2-connect__learn-more">
					<a
						href={ localizeUrl( 'https://wordpress.com/support/third-party-applications/' ) }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ translate( 'Learn more about how %(client)s uses your data', {
							args: { client: meta.client.title },
						} ) }
					</a>
				</div>

				{ showSuccessMessage ? (
					<div className="oauth2-connect__success">
						<svg
							className="oauth2-connect__success-icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 50 50"
							aria-label="Success"
						>
							<circle style={ { fill: '#008A20' } } cx="25" cy="25" r="25" />
							<polyline
								style={ {
									fill: 'none',
									stroke: '#FFFFFF',
									strokeWidth: 5,
									strokeLinecap: 'round',
									strokeLinejoin: 'round',
								} }
								points="38,15 22,33 12,25"
							/>
						</svg>
						<div className="oauth2-connect__success-content">
							<div className="oauth2-connect__success-title">
								{ translate( 'Success! You can return to %(client)s', {
									args: { client: meta.client.title },
								} ) }
							</div>
							<div className="oauth2-connect__success-description">
								{ translate( 'You have successfully connected your WordPress.com account.' ) }
							</div>
						</div>
					</div>
				) : (
					<div className="oauth2-connect__actions">
						<Button variant="secondary" onClick={ onDeny }>
							{ translate( 'Deny' ) }
						</Button>
						<Button variant="primary" onClick={ onApprove }>
							{ translate( 'Approve' ) }
						</Button>
					</div>
				) }
			</div>
		);
	}

	return <OneLoginLayout isJetpack={ false }>{ content }</OneLoginLayout>;
}

export default Authorize;
