import { useEffect } from '@wordpress/element';
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
				'Give {{span}}%(client)s{{/span}} access to your WordPress.comaccount',
				{
					args: { client: oauth2Client.name },
					components: { span: <span className="wp-login__one-login-header-client-name" /> },
				}
			),
			subHeadingSecondary: null,
		} );
	}, [ oauth2Client?.name ] );

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

	let content = null;
	if ( isLoading || ! meta ) {
		content = <div className="oauth2-connect__loading">Loading...</div>;
	}

	if ( error ) {
		content = <div className="oauth2-connect__error">{ error.message }</div>;
	}

	if ( meta ) {
		content = (
			<div className="oauth2-connect">
				{ meta.user && (
					<div className="oauth2-connect__user">
						<div>{ meta.user.display_name }</div>
						<div>{ meta.user.email }</div>
						<button onClick={ onSwitch }>Use a different account</button>
					</div>
				) }
				<div className="oauth2-connect__permissions">
					<p>This will allow { meta.client.title } to:</p>
					<ul>
						{ meta.permissions.slice( 0, 3 ).map( ( p ) => (
							<li key={ p.name }>{ p.description }</li>
						) ) }
					</ul>
				</div>
				<div className="oauth2-connect__actions">
					<button onClick={ onDeny }>Deny</button>
					<button onClick={ onApprove }>Approve</button>
				</div>
			</div>
		);
	}

	return <OneLoginLayout isJetpack={ false }>{ content }</OneLoginLayout>;
}

export default Authorize;
