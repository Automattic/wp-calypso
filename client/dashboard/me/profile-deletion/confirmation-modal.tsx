import { localizeUrl } from '@automattic/i18n-utils';
import {
	Button,
	Modal,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight, help } from '@wordpress/icons';
import ActionList from '../../components/action-list';
import { ButtonStack } from '../../components/button-stack';
import RouterLinkButton from '../../components/router-link-button';

interface AlternativeOption {
	text: string;
	to: string;
	supportLink?: string;
}

interface AccountDeletionConfirmModalProps {
	onClose: () => void;
	onConfirm: () => void;
	username: string;
	isDeleting: boolean;
	siteCount?: number;
}

export default function AccountDeletionConfirmModal( {
	onClose,
	onConfirm,
	username,
	isDeleting,
	siteCount = 0,
}: AccountDeletionConfirmModalProps ) {
	const [ showAlternatives, setShowAlternatives ] = useState( true );
	const [ confirmText, setConfirmText ] = useState( '' );
	const isConfirmDisabled = confirmText !== username || isDeleting;

	// Alternative options to show before account deletion
	const alternativeOptions: AlternativeOption[] = [
		...( siteCount > 0
			? [
					{
						text: __( "Change your site's address" ),
						to: '/v2/domains',
						supportLink: localizeUrl( 'https://wordpress.com/support/changing-site-address/' ),
					},
					{
						text: __( 'Delete a site' ),
						to: '/v2/sites',
						supportLink: localizeUrl( 'https://wordpress.com/support/delete-site/' ),
					},
			  ]
			: [] ),
		{
			text: __( 'Start a new site' ),
			to: '/start?ref=me-account-close',
			supportLink: localizeUrl( 'https://wordpress.com/support/create-a-blog/' ),
		},
		{
			text: __( 'Change your username' ),
			to: '/v2/me/account',
			supportLink: localizeUrl( 'https://wordpress.com/support/change-your-username/' ),
		},
		{
			text: __( 'Change your password' ),
			to: '/v2/me/security',
			supportLink: localizeUrl( 'https://wordpress.com/support/passwords/' ),
		},
	];

	const handleContinue = () => {
		setShowAlternatives( false );
	};

	if ( showAlternatives ) {
		return (
			<Modal title={ __( 'Are you sure?' ) } onRequestClose={ onClose }>
				<VStack spacing={ 6 }>
					<Text>
						{ __( "Here's a few options to try before you permanently delete your account." ) }
					</Text>
					<ActionList>
						{ alternativeOptions.map( ( option ) => (
							<ActionList.ActionItem
								key={ option.to }
								title={ option.text }
								actions={
									<HStack spacing={ 0 } expanded={ false }>
										{ option.supportLink && (
											<Button
												variant="tertiary"
												icon={ help }
												size="compact"
												href={ option.supportLink }
												target="_blank"
												rel="noopener noreferrer"
												aria-label={ __( 'Get help' ) }
											/>
										) }
										<RouterLinkButton
											__next40pxDefaultSize
											variant="tertiary"
											icon={ isRTL() ? chevronLeft : chevronRight }
											size="compact"
											to={ option.to }
											rel="noopener noreferrer"
											aria-label={ option.text }
										/>
									</HStack>
								}
							/>
						) ) }
					</ActionList>
					<ButtonStack justify="flex-end">
						<Button variant="tertiary" onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
						<Button variant="primary" onClick={ handleContinue }>
							{ __( 'Continue' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</Modal>
		);
	}

	return (
		<Modal title={ __( 'Confirm account deletion' ) } onRequestClose={ onClose }>
			<VStack spacing={ 6 }>
				<Text>
					{ __(
						'Please type your username in the field below to confirm. Your account will then be gone forever.'
					) }
				</Text>
				<TextControl
					label={ __( 'Type your username to confirm' ) }
					value={ confirmText }
					onChange={ setConfirmText }
					placeholder={ username }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<ButtonStack justify="flex-end">
					<Button variant="tertiary" onClick={ onClose } disabled={ isDeleting }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						isDestructive
						onClick={ onConfirm }
						disabled={ isConfirmDisabled }
						isBusy={ isDeleting }
					>
						{ isDeleting ? __( 'Deleting account…' ) : __( 'Delete account' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
