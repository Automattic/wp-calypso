import { useEffect } from '@wordpress/element';
import LoginContextProvider from 'calypso/login/login-context';
import OneLoginLayout from 'calypso/login/wp-login/components/one-login-layout';
import useAuthorizeMeta from '../hooks/use-authorize-meta';

function Authorize() {
	const params = Object.fromEntries( new URLSearchParams( window.location.search ) ) as Record<
		string,
		string
	>;
	const { data: meta, isLoading, error } = useAuthorizeMeta( { params } );

	useEffect( () => {
		if ( ! meta ) {
			return;
		}
		if ( ! meta.flags.user_logged_in && meta.links?.calypso_login_url ) {
			window.location.replace( meta.links.calypso_login_url );
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
				<div className="oauth2-connect__header">
					{ meta.client.icon && <img src={ meta.client.icon } alt="" width={ 40 } height={ 40 } /> }
					<h1>Authorize { meta.client.title }</h1>
				</div>
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

	return (
		<LoginContextProvider>
			<OneLoginLayout isJetpack={ false }>{ content }</OneLoginLayout>
		</LoginContextProvider>
	);
}

export default Authorize;
