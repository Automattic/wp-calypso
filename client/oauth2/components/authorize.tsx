import { localizeUrl } from '@automattic/i18n-utils';
import { Button, Spinner, Notice } from '@wordpress/components';
import { useEffect, useLayoutEffect, useRef, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { ActionButtons } from 'calypso/components/connect-screen/action-buttons';
import { PermissionsList } from 'calypso/components/connect-screen/permissions-list';
import { UserCard, UserCardUser } from 'calypso/components/connect-screen/user-card';
import { useLoginContext } from 'calypso/login/login-context';
import OneLoginLayout from 'calypso/login/wp-login/components/one-login-layout';
import { useDispatch, useSelector } from 'calypso/state';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { handleApprove, handleDeny } from '../hooks/use-authorize-actions';
import useAuthorizeMeta from '../hooks/use-authorize-meta';
import { getPermissionIcon } from '../utils/permission-icons';
import SuccessMessage from './success-message';

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
	// Use useLayoutEffect to ensure headers are set synchronously before paint
	useLayoutEffect( () => {
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
			<div className="oauth2-connect oauth2-connect--loading">
				<div className="oauth2-connect__loading">
					<Spinner />
				</div>
			</div>
		);
	} else if ( error ) {
		content = (
			<Notice status="error" isDismissible={ false }>
				{ error.message || translate( 'An error occurred while loading authorization details.' ) }
			</Notice>
		);
	} else {
		// Transform API user to UserCardUser interface
		const userCardUser: UserCardUser | null = meta.user
			? {
					displayName: meta.user.display_name,
					email: meta.user.email,
					avatarUrl: meta.user.avatar_URL,
					username: meta.user.username,
					siteCount: meta.user.site_count,
			  }
			: null;

		// Map variant names: 'horizontal' -> 'small', 'centered' -> 'large'
		const userCardSize = userCardVariant === 'centered' ? 'large' : 'small';

		// Transform permissions for PermissionsList component
		const permissions = meta.permissions.map( ( permission ) => ( {
			name: permission.name,
			label: permission.description,
		} ) );

		content = (
			<div className="oauth2-connect">
				{ userCardUser && <UserCard user={ userCardUser } size={ userCardSize } showSiteCount /> }

				{ showPermissions && (
					<PermissionsList
						title={ translate( '%(client)s is requesting access to:', {
							args: { client: meta.client.title },
						} ) }
						permissions={ permissions }
						getIconForPermission={ getPermissionIcon }
						learnMoreText={ translate( 'Learn more about how %(client)s uses your data', {
							args: { client: meta.client.title },
						} ) }
						learnMoreUrl={ localizeUrl(
							'https://wordpress.com/support/third-party-applications/'
						) }
					/>
				) }

				{ showSuccessMessage && <SuccessMessage clientTitle={ meta.client.title } /> }

				{ ! showSuccessMessage &&
					( renderActions ? (
						renderActions( { onApprove, onDeny } )
					) : (
						<ActionButtons
							primaryLabel={ approveButtonText || translate( 'Approve' ) }
							primaryOnClick={ onApprove }
							primaryClassName={ approveButtonClassName }
							secondaryLabel={ denyButtonText || translate( 'Deny' ) }
							secondaryOnClick={ onDeny }
							secondaryClassName={ denyButtonClassName }
						/>
					) ) }

				{ userCardUser && ! showSuccessMessage && (
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
	// Using headersSet ensures we wait for the effect to complete
	if ( ! headersSet ) {
		return (
			<div className="oauth2-connect oauth2-connect--loading">
				<div className="oauth2-connect__loading">
					<Spinner />
				</div>
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
