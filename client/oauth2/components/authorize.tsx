import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
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
		const target = meta.links.authorize;
		const qp = new URLSearchParams( window.location.search );
		if ( meta.nonce?._wpnonce ) {
			qp.set( '_wpnonce', meta.nonce._wpnonce );
		}
		window.location.href = `${ target }?${ qp.toString() }`;
	};

	const onDeny = () => {
		if ( ! meta ) {
			return;
		}
		window.location.href = meta.links.deny;
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
					<div className="oauth2-connect__user-card">
						<div className="oauth2-connect__user-info">
							<div className="oauth2-connect__user-name">{ meta.user.display_name }</div>
							<div className="oauth2-connect__user-details">{ meta.user.email }</div>
						</div>
						<Button variant="link" onClick={ onSwitch } className="oauth2-connect__switch-account">
							{ translate( 'Log in with a different account' ) }
						</Button>
					</div>
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

				<div className="oauth2-connect__actions">
					<Button variant="secondary" onClick={ onDeny }>
						{ translate( 'Deny' ) }
					</Button>
					<Button variant="primary" onClick={ onApprove }>
						{ translate( 'Approve' ) }
					</Button>
				</div>
			</div>
		);
	}

	return <OneLoginLayout isJetpack={ false }>{ content }</OneLoginLayout>;
}

export default Authorize;
