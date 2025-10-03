import { connectSocialUserMutation, disconnectSocialUserMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { securitySocialLoginsRoute } from '../../app/router/me';
import { ActionList } from '../../components/action-list';
import ConfirmModal from '../../components/confirm-modal';
import PageLayout from '../../components/page-layout';
import AppleIcon from '../../images/apple-logo.svg';
import GitHubIcon from '../../images/github-logo.svg';
import GoogleIcon from '../../images/google-logo.svg';
import SecurityPageHeader from '../security-page-header';
import AppleLogin from './apple-login';
import GitHubLogin from './github-login';
import GoogleLogin from './google-login';
import type { SocialLoginButtonProps } from './types';
import type { SocialLoginConnection, ConnectSocialUserArgs } from '@automattic/api-core';

const SocialLoginItem = ( {
	service,
	decoration,
	renderButton,
}: {
	service: string;
	decoration: string;
	renderButton: ( {
		isConnected,
		responseHandler,
		handleDisconnect,
		isLoading,
	}: SocialLoginButtonProps ) => React.ReactNode;
} ) => {
	const { user } = useAuth();
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { mutate: disconnectSocialUser, isPending: isDisconnectingSocialUser } = useMutation(
		disconnectSocialUserMutation()
	);
	const { mutate: connectSocialUser, isPending: isConnectingSocialUser } = useMutation(
		connectSocialUserMutation()
	);

	const [ isRemoveDialogOpen, setIsRemoveDialogOpen ] = useState( false );

	const lowerCaseService = service.toLowerCase();

	const socialLoginConnection = user.social_login_connections?.find(
		( connection: SocialLoginConnection ) => connection.service === lowerCaseService
	);
	const isConnected = !! socialLoginConnection;

	const responseHandler = ( data: ConnectSocialUserArgs ) => {
		// Redirect to remove the query args
		router.navigate( {
			to: securitySocialLoginsRoute.fullPath,
		} );
		connectSocialUser( data, {
			onSuccess: () => {
				createSuccessNotice(
					sprintf(
						/* translators: %s is the name of the social login */
						__( '%s login connected.' ),
						service
					),
					{
						type: 'snackbar',
					}
				);
			},
			onError: () => {
				createErrorNotice( __( 'Failed to connect social login.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const disconnectSocialLogin = () => {
		disconnectSocialUser( lowerCaseService, {
			onSuccess: () => {
				createSuccessNotice(
					sprintf(
						/* translators: %s is the name of the social login */
						__( '%s login disconnected.' ),
						service
					),
					{
						type: 'snackbar',
					}
				);
			},
			onError: () => {
				createErrorNotice( __( 'Failed to disconnect social login.' ), {
					type: 'snackbar',
				} );
			},
			onSettled: () => {
				setIsRemoveDialogOpen( false );
			},
		} );
	};

	return (
		<>
			<ActionList.ActionItem
				title={ service }
				description={ socialLoginConnection?.service_user_email }
				decoration={
					<Icon
						icon={
							<img src={ decoration } alt={ service } style={ { width: '24px', height: '24px' } } />
						}
					/>
				}
				actions={ renderButton( {
					isConnected,
					responseHandler,
					handleDisconnect: () => {
						recordTracksEvent( 'calypso_dashboard_security_social_logins_disconnect_dialog_open' );
						setIsRemoveDialogOpen( true );
					},
					isLoading: isConnectingSocialUser,
				} ) }
			/>
			<ConfirmModal
				isOpen={ isRemoveDialogOpen }
				confirmButtonProps={ {
					label: __( 'Remove social login' ),
					isBusy: isDisconnectingSocialUser,
					disabled: isDisconnectingSocialUser,
				} }
				onCancel={ () => setIsRemoveDialogOpen( false ) }
				onConfirm={ disconnectSocialLogin }
			>
				{ sprintf(
					/* translators: %s is the name of the social login */
					__( 'Are you sure you want to remove %s social login?' ),
					service
				) }
			</ConfirmModal>
		</>
	);
};

export default function SecuritySocialLogins() {
	const redirectUri =
		typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined;

	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'Social logins' ) }
					description={ __( 'Log in faster with the accounts you already use.' ) }
				/>
			}
		>
			<ActionList>
				<SocialLoginItem
					service="Google"
					decoration={ GoogleIcon }
					renderButton={ ( { isConnected, responseHandler, handleDisconnect, isLoading } ) => (
						<GoogleLogin
							isConnected={ isConnected }
							responseHandler={ responseHandler }
							handleDisconnect={ handleDisconnect }
							isLoading={ isLoading }
						/>
					) }
				/>
				<SocialLoginItem
					service="Apple"
					decoration={ AppleIcon }
					renderButton={ ( { isConnected, responseHandler, handleDisconnect, isLoading } ) => (
						<AppleLogin
							isConnected={ isConnected }
							responseHandler={ responseHandler }
							handleDisconnect={ handleDisconnect }
							isLoading={ isLoading }
						/>
					) }
				/>
				<SocialLoginItem
					service="GitHub"
					decoration={ GitHubIcon }
					renderButton={ ( { isConnected, responseHandler, handleDisconnect, isLoading } ) => (
						<GitHubLogin
							isConnected={ isConnected }
							responseHandler={ responseHandler }
							redirectUri={ redirectUri }
							handleDisconnect={ handleDisconnect }
							isLoading={ isLoading }
						/>
					) }
				/>
			</ActionList>
		</PageLayout>
	);
}
