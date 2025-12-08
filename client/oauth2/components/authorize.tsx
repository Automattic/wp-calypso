import { Button, Spinner, Notice } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useLoginContext } from 'calypso/login/login-context';
import OneLoginLayout from 'calypso/login/wp-login/components/one-login-layout';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { handleApprove, handleDeny, handleSwitch } from '../hooks/use-authorize-actions';
import useAuthorizeMeta from '../hooks/use-authorize-meta';
import PermissionsList from './permissions-list';
import SuccessMessage from './success-message';
import UserCard from './user-card';

interface AuthorizeProps {
	/**
	 * Optional flag to control whether the heading logo should be displayed.
	 * Defaults to true. Set to false for clients that don't want to show a logo.
	 */
	showLogo?: boolean;
}

function Authorize( { showLogo = true }: AuthorizeProps = {} ) {
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

	const onApprove = () => {
		if ( ! meta ) {
			return;
		}
		handleApprove( meta, () => setShowSuccessMessage( true ) );
	};

	const onDeny = () => {
		if ( ! meta ) {
			return;
		}
		handleDeny( meta );
	};

	const onSwitch = () => {
		if ( ! meta ) {
			return;
		}
		handleSwitch( meta );
	};

	let content = null;
	if ( isLoading || ! meta ) {
		content = (
			<div className="oauth2-connect__loading">
				<Spinner />
				<p>{ translate( 'Loading authorization details…' ) }</p>
			</div>
		);
	}

	if ( error ) {
		content = (
			<Notice status="error" isDismissible={ false }>
				{ error.message || translate( 'An error occurred while loading authorization details.' ) }
			</Notice>
		);
	}

	if ( meta ) {
		content = (
			<div className="oauth2-connect">
				{ meta.user && <UserCard user={ meta.user } onSwitch={ onSwitch } /> }

				<PermissionsList permissions={ meta.permissions } clientTitle={ meta.client.title } />

				{ showSuccessMessage ? (
					<SuccessMessage clientTitle={ meta.client.title } />
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

	return (
		<OneLoginLayout isJetpack={ false } showLogo={ showLogo }>
			{ content }
		</OneLoginLayout>
	);
}

export default Authorize;
