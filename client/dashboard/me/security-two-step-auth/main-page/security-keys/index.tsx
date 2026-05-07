import {
	twoStepAuthSecurityKeysQuery,
	deleteTwoStepAuthSecurityKeyMutation,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { ActionList } from '../../../../components/action-list';
import ConfirmModal from '../../../../components/confirm-modal';
import InlineSupportLink from '../../../../components/inline-support-link';
import { SectionHeader } from '../../../../components/section-header';
import { isWebAuthnSupported } from '../../utils';
import EnhancedSecurity from '../enhanced-security';
import RegisterKey from './register-key';
import type { UserTwoStepAuthSecurityKeys } from '@automattic/api-core';

type SecurityKeyRegistration = UserTwoStepAuthSecurityKeys[ 'registrations' ][ number ];

const SecurityKeyItem = ( {
	item,
	onRemove,
}: {
	item: SecurityKeyRegistration;
	onRemove: () => void;
} ) => {
	const { recordTracksEvent } = useAnalytics();

	const handleRemoveClick = () => {
		recordTracksEvent(
			'calypso_dashboard_security_two_step_auth_security_keys_remove_key_dialog_open'
		);
		onRemove();
	};

	return (
		<ActionList.ActionItem
			title={ item.name }
			actions={
				<Button variant="secondary" size="compact" isDestructive onClick={ handleRemoveClick }>
					{ __( 'Remove' ) }
				</Button>
			}
		/>
	);
};

const SecurityKeysList = ( {
	data,
	onRemoveKey,
	onAddKey,
}: {
	data: SecurityKeyRegistration[];
	onRemoveKey: ( item: SecurityKeyRegistration ) => void;
	onAddKey: () => void;
} ) => {
	const isBrowserSupported = isWebAuthnSupported();

	return (
		<ActionList>
			<VStack spacing={ 4 } style={ { paddingBlock: '16px' } }>
				<HStack justify="space-between" alignment="top">
					<SectionHeader
						level={ 3 }
						title={ __( 'Security keys' ) }
						description={
							isBrowserSupported
								? createInterpolateElement(
										__(
											'Use a <securityKeyLink>security key</securityKeyLink> to log in to your account.'
										),
										{
											securityKeyLink: (
												<InlineSupportLink supportContext="two-step-authentication-security-key" />
											),
										}
								  )
								: __(
										'Your browser doesn‘t support the FIDO2 security key standard yet. To use a second factor security key to sign in please try a supported browser like Chrome, Safari, or Firefox.'
								  )
						}
					/>
					{ isBrowserSupported && (
						<VStack style={ { flexShrink: 0 } }>
							<Button variant="secondary" size="compact" onClick={ onAddKey }>
								{ __( 'Register key' ) }
							</Button>
						</VStack>
					) }
				</HStack>
			</VStack>
			{ data?.map( ( item ) => (
				<SecurityKeyItem key={ item.id } item={ item } onRemove={ () => onRemoveKey( item ) } />
			) ) }
		</ActionList>
	);
};

export default function SecurityKeys() {
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice } = useDispatch( noticesStore );

	const [ isAddKeyModalOpen, setIsAddKeyModalOpen ] = useState( false );
	const [ selectedKeyToRemove, setSelectedKeyToRemove ] =
		useState< SecurityKeyRegistration | null >( null );

	const { data: securityKeys } = useQuery( twoStepAuthSecurityKeysQuery() );

	const registrations = securityKeys?.registrations ?? [];

	const { mutate: deleteSecurityKey, isPending: isDeletingSecurityKey } = useMutation( {
		...deleteTwoStepAuthSecurityKeyMutation(),
		meta: {
			snackbar: {
				success: __( 'Security key deleted.' ),
			},
		},
	} );

	const handleRemoveKey = ( item: SecurityKeyRegistration ) => {
		setSelectedKeyToRemove( item );
	};

	const handleRemove = () => {
		recordTracksEvent( 'calypso_dashboard_security_two_step_auth_security_keys_remove_key_click' );
		if ( selectedKeyToRemove ) {
			deleteSecurityKey(
				{ credential_id: selectedKeyToRemove.id },
				{
					onError: ( error ) => {
						let errorMessage = __( 'Failed to delete security key.' );
						if ( error instanceof Error ) {
							errorMessage = error.message;
						}
						createErrorNotice( errorMessage, { type: 'snackbar' } );
					},
					onSettled: () => {
						setSelectedKeyToRemove( null );
					},
				}
			);
		}
	};

	const handleAddKey = () => {
		setIsAddKeyModalOpen( true );
		recordTracksEvent(
			'calypso_dashboard_security_two_step_auth_security_keys_register_key_modal_open'
		);
	};

	return (
		<>
			<SecurityKeysList
				data={ registrations }
				onRemoveKey={ handleRemoveKey }
				onAddKey={ handleAddKey }
			/>
			{ isEnabled( 'two-factor/enhanced-security' ) && registrations.length > 0 && (
				<EnhancedSecurity />
			) }
			{ isAddKeyModalOpen && <RegisterKey onClose={ () => setIsAddKeyModalOpen( false ) } /> }
			<ConfirmModal
				isOpen={ !! selectedKeyToRemove }
				confirmButtonProps={ {
					label: __( 'Remove security key' ),
					isBusy: isDeletingSecurityKey,
					disabled: isDeletingSecurityKey,
				} }
				onCancel={ () => setSelectedKeyToRemove( null ) }
				onConfirm={ handleRemove }
			>
				{ __( 'Are you sure you want to remove this security key?' ) }
			</ConfirmModal>
		</>
	);
}
