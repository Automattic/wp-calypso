import { Button, Spinner, Notice } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useLoginContext } from 'calypso/login/login-context';
import OneLoginLayout from 'calypso/login/wp-login/components/one-login-layout';
import { useDispatch, useSelector } from 'calypso/state';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { handleApprove, handleDeny } from '../hooks/use-authorize-actions';
import useAuthorizeMeta from '../hooks/use-authorize-meta';
import AuthorizeActions from './authorize-actions';
import PermissionsList from './permissions-list';
import SuccessMessage from './success-message';
import UserCard from './user-card';

export interface AuthorizeActionsRenderProps {
	onApprove: () => void;
	onDeny: () => void;
}

export interface AuthorizeProps {
	/**
	 * Optional flag to control whether the heading logo should be displayed.
	 * Defaults to false. Set to true for clients that want to show a logo.
	 */
	showLogo?: boolean;
	/**
	 * Optional flag to control whether the permissions list should be displayed.
	 * Defaults to false. Set to true for clients that need to show permissions.
	 */
	showPermissions?: boolean;
	/**
	 * Variant for the user card display.
	 * Defaults to "horizontal".
	 */
	userCardVariant?: 'horizontal' | 'centered';
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
	 * Custom CSS class for the approve button.
	 */
	approveButtonClassName?: string;
	/**
	 * Custom CSS class for the deny button.
	 */
	denyButtonClassName?: string;
	/**
	 * Custom render function for the action buttons.
	 * If provided, this will override the default button layout and all button-related props.
	 * The function receives onApprove and onDeny callbacks.
	 */
	renderActions?: ( props: AuthorizeActionsRenderProps ) => JSX.Element;
}

function Authorize( {
	showLogo = false,
	showPermissions = false,
	userCardVariant,
	approveButtonText,
	denyButtonText,
	approveButtonClassName,
	denyButtonClassName,
	renderActions,
}: AuthorizeProps = {} ) {
	const params = Object.fromEntries( new URLSearchParams( window.location.search ) ) as Record<
		string,
		string
	>;
	const { setHeaders } = useLoginContext();
	const translate = useTranslate();
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const [ showSuccessMessage, setShowSuccessMessage ] = useState( false );
	const [ headersSet, setHeadersSet ] = useState( false );
	const redirectingToLogin = useRef( false );

	// Only fetch authorization metadata after user check is complete
	// Wait until currentUser is loaded: either null (not logged in) or has an ID (logged in)
	// Don't fetch if currentUser is undefined (still loading)
	const userCheckComplete =
		currentUser !== undefined && ( currentUser === null || !! currentUser.ID );
	const isLoggedIn = !! ( currentUser && currentUser.ID );
	const {
		data: meta,
		isLoading,
		error,
	} = useAuthorizeMeta( {
		params,
		// Only fetch if user is logged in (not just when check is complete)
		enabled: userCheckComplete && isLoggedIn,
	} );

	// Set initial headers only after confirming user is authenticated
	// This prevents flashing the layout before redirect to login
	useEffect( () => {
		// Don't set headers until we know user is authenticated
		if ( ! userCheckComplete || ! isLoggedIn ) {
			return;
		}

		const clientName = oauth2Client?.name || meta?.client?.title;

		if ( clientName ) {
			setHeaders( {
				heading: translate( 'Connect {{span}}%(client)s{{/span}}', {
					args: { client: clientName },
					components: { span: <span className="wp-login__one-login-header-client-name" /> },
				} ),
				subHeading: translate(
					'Give {{span}}%(client)s{{/span}} access to your WordPress.com account',
					{
						args: { client: clientName },
						components: { span: <span className="wp-login__one-login-header-client-name" /> },
					}
				),
				subHeadingSecondary: null,
			} );
			setHeadersSet( true );
		} else {
			// Set default headers while loading
			setHeaders( {
				heading: translate( 'Connect' ),
				subHeading: translate( 'Give access to your WordPress.com account' ),
				subHeadingSecondary: null,
			} );
			setHeadersSet( true );
		}
	}, [ oauth2Client, meta, setHeaders, translate, userCheckComplete, isLoggedIn ] );

	useEffect( () => {
		// Redirect to login if user check is complete and user is not logged in
		// Use ref to ensure redirect only happens once and prevent race conditions
		if ( userCheckComplete && ! isLoggedIn && ! redirectingToLogin.current ) {
			redirectingToLogin.current = true;
			// Build the redirect URL to return to this page after login
			const currentUrl = window.location.pathname + window.location.search;
			const loginUrl = `/log-in?redirect_to=${ encodeURIComponent( currentUrl ) }`;
			window.location.replace( loginUrl );
		}
	}, [ userCheckComplete, isLoggedIn ] );

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
		// Build the login URL to redirect to after logout
		// Use absolute URL so backend redirects back to current environment
		const currentUrl = window.location.pathname + window.location.search;
		const loginUrl =
			window.location.origin + `/log-in?redirect_to=${ encodeURIComponent( currentUrl ) }`;

		// Dispatch logout action which will clear session and redirect
		dispatch( redirectToLogout( loginUrl ) );
	};

	// Don't pass a custom signupUrl - let OneLoginLayout use its default getSignupUrl() logic
	// which already handles OAuth clients properly via the oauth2Client from Redux

	let content = null;
	if ( isLoading || ! meta ) {
		content = (
			<div className="oauth2-connect__loading">
				<Spinner />
				<p>{ translate( 'Loading authorization details…' ) }</p>
			</div>
		);
	} else if ( error ) {
		content = (
			<Notice status="error" isDismissible={ false }>
				{ error.message || translate( 'An error occurred while loading authorization details.' ) }
			</Notice>
		);
	} else {
		content = (
			<div className="oauth2-connect">
				{ meta.user && <UserCard user={ meta.user } variant={ userCardVariant } /> }

				{ showPermissions && (
					<PermissionsList permissions={ meta.permissions } clientTitle={ meta.client.title } />
				) }

				{ showSuccessMessage && <SuccessMessage clientTitle={ meta.client.title } /> }

				{ ! showSuccessMessage &&
					( renderActions ? (
						renderActions( { onApprove, onDeny } )
					) : (
						<AuthorizeActions
							onApprove={ onApprove }
							onDeny={ onDeny }
							approveButtonText={ approveButtonText }
							denyButtonText={ denyButtonText }
							approveButtonClassName={ approveButtonClassName }
							denyButtonClassName={ denyButtonClassName }
						/>
					) ) }

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

	// Don't render OneLoginLayout until headers are set
	if ( ! headersSet ) {
		return null;
	}

	return (
		<OneLoginLayout isJetpack={ false } showLogo={ showLogo }>
			{ content }
		</OneLoginLayout>
	);
}

export default Authorize;
