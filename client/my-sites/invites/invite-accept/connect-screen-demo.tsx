import { localizeUrl } from '@automattic/i18n-utils';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import wooLogo from 'calypso/assets/images/icons/Woo_logo_color.svg';
import {
	ScreenLayout,
	BrandHeader,
	UserCard,
	ActionButtons,
	ConsentText,
	PermissionsList,
	LoadingScreen,
} from 'calypso/components/connect-screen';

/**
 * Demo component to test all connect-screen components
 * Access via: /accept-invite/{site}/{key}?connect_screen_demo=1
 */
export function ConnectScreenDemo(): JSX.Element {
	const translate = useTranslate();
	const [ isLoading, setIsLoading ] = useState( false );
	const [ showLoadingScreen, setShowLoadingScreen ] = useState( false );

	const demoUser = {
		displayName: 'John Doe',
		email: 'john.doe@example.com',
		avatarUrl: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60',
	};

	const demoUser2 = {
		displayName: 'Mike Tillman',
		email: 'mike.tillman@gmail.com',
	};

	const demoPermissions = [
		{ icon: 'view' as const, label: translate( 'View your profile information' ) },
		{ icon: 'edit' as const, label: translate( 'Edit posts and pages' ) },
		{ icon: 'manage' as const, label: translate( 'Manage site settings' ) },
		{ icon: 'check' as const, label: translate( 'Publish new content' ) },
		{ icon: 'view' as const, label: translate( 'Access analytics data' ) },
		{ icon: 'edit' as const, label: translate( 'Moderate comments' ) },
	];

	const handleAccept = () => {
		setIsLoading( true );
		setTimeout( () => {
			setIsLoading( false );
			setShowLoadingScreen( true );
			setTimeout( () => setShowLoadingScreen( false ), 2000 );
		}, 1500 );
	};

	const handleDecline = () => {
		// eslint-disable-next-line no-alert
		alert( 'Declined!' );
	};

	const handleSignIn = () => {
		// eslint-disable-next-line no-alert
		alert( 'Sign in with another account' );
	};

	if ( showLoadingScreen ) {
		return (
			<ScreenLayout>
				<LoadingScreen message={ translate( 'Connecting your account\u2026' ) } />
			</ScreenLayout>
		);
	}

	return (
		<ScreenLayout backgroundColor="#f6f7f7">
			<BrandHeader
				logo={ wooLogo }
				logoAlt="Woo"
				logoWidth={ 72 }
				logoHeight={ 24 }
				title={ translate( 'Join the Woo team' ) }
				description={ translate(
					"You've been invited to collaborate on this store. Accept to get started."
				) }
			/>

			<UserCard user={ demoUser } size="small" />
			<UserCard user={ demoUser2 } size="large" />

			<PermissionsList
				title={ translate( 'This app will be able to:' ) }
				permissions={ demoPermissions }
				maxVisible={ 4 }
				learnMoreText={ translate( 'Learn more about how Service uses your data' ) }
				learnMoreUrl={ localizeUrl( 'https://wordpress.com/support/' ) }
			/>

			<ActionButtons
				primaryLabel={ isLoading ? translate( 'Joining\u2026' ) : translate( 'Accept Invite' ) }
				primaryOnClick={ handleAccept }
				primaryLoading={ isLoading }
				secondaryLabel={ translate( 'Decline' ) }
				secondaryOnClick={ handleDecline }
				tertiaryLabel={ translate( 'Sign in with another account' ) }
				tertiaryOnClick={ handleSignIn }
			/>

			<ConsentText
				text={ translate(
					'By continuing, you agree to our <tosLink>Terms of Service</tosLink> and have read our <privacyLink>Privacy Policy</privacyLink>.'
				) }
				links={ {
					tosLink: localizeUrl( 'https://wordpress.com/tos/' ),
					privacyLink: localizeUrl( 'https://automattic.com/privacy/' ),
				} }
			/>
		</ScreenLayout>
	);
}
