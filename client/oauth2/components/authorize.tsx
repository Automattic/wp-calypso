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
	/**
	 * Optional flag to control whether the permissions list should be displayed.
	 * Defaults to true. Set to false for clients that don't need to show permissions.
	 */
	showPermissions?: boolean;
	/**
	 * Custom text for the approve button.
	 * Defaults to "Approve".
	 */
	approveButtonText?: string;
	/**
	 * Custom text for the deny button.
	 * Defaults to "Deny".
	 */
	denyButtonText?: string;
	/**
	 * Variant for the approve button.
	 * Defaults to "primary".
	 */
	approveButtonVariant?: 'primary' | 'secondary' | 'tertiary' | 'link';
	/**
	 * Variant for the deny button.
	 * Defaults to "secondary".
	 */
	denyButtonVariant?: 'primary' | 'secondary' | 'tertiary' | 'link';
	/**
	 * Custom CSS class for the approve button.
	 */
	approveButtonClassName?: string;
	/**
	 * Custom CSS class for the deny button.
	 */
	denyButtonClassName?: string;
}

function Authorize( {
	showLogo = true,
	showPermissions = true,
	approveButtonText,
	denyButtonText,
	approveButtonVariant = 'primary',
	denyButtonVariant = 'secondary',
	approveButtonClassName,
	denyButtonClassName,
}: AuthorizeProps = {} ) {
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
				{ meta.user && <UserCard user={ meta.user } /> }

				{ showPermissions && (
					<PermissionsList permissions={ meta.permissions } clientTitle={ meta.client.title } />
				) }

				{ showSuccessMessage ? (
					<SuccessMessage clientTitle={ meta.client.title } />
				) : (
					<div className="oauth2-connect__actions">
						<Button
							variant={ denyButtonVariant }
							onClick={ onDeny }
							className={ denyButtonClassName }
						>
							{ denyButtonText || translate( 'Deny' ) }
						</Button>
						<Button
							variant={ approveButtonVariant }
							onClick={ onApprove }
							className={ approveButtonClassName }
						>
							{ approveButtonText || translate( 'Approve' ) }
						</Button>
					</div>
				) }

				{ meta.user && (
					<div className="oauth2-connect__switch-account-link">
						<Button variant="link" onClick={ onSwitch } className="oauth2-connect__switch-account">
							{ translate( 'Log in with a different account' ) }
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
