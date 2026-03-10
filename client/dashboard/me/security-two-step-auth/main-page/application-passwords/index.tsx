import {
	twoStepAuthApplicationPasswordsQuery,
	deleteTwoStepAuthApplicationPasswordMutation,
} from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { useLocale } from '../../../../app/locale';
import { ActionList } from '../../../../components/action-list';
import ConfirmModal from '../../../../components/confirm-modal';
import InlineSupportLink from '../../../../components/inline-support-link';
import { SectionHeader } from '../../../../components/section-header';
import RegisterApplicationPassword from './register-application-password';
import type { TwoStepAuthApplicationPassword } from '@automattic/api-core';

const ApplicationPasswordsList = ( {
	item,
	onRemove,
}: {
	item: TwoStepAuthApplicationPassword;
	onRemove: () => void;
} ) => {
	const locale = useLocale();

	const { recordTracksEvent } = useAnalytics();

	const date = new Date( item.generated );
	const formattedDate =
		date.toLocaleDateString( locale, {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		} ) +
		' ' +
		date.toLocaleTimeString( locale, {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		} );

	return (
		<ActionList.ActionItem
			title={ item.name }
			description={ sprintf(
				/* translators: %s is the date of the generated password */
				__( 'Generated on %s' ),
				formattedDate
			) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					isDestructive
					onClick={ () => {
						recordTracksEvent(
							'calypso_dashboard_security_application_passwords_remove_password_dialog_open'
						);
						onRemove();
					} }
				>
					{ __( 'Remove' ) }
				</Button>
			}
		/>
	);
};

export default function ApplicationPasswords() {
	const { recordTracksEvent } = useAnalytics();

	const [ isAddApplicationPasswordModalOpen, setIsAddApplicationPasswordModalOpen ] =
		useState( false );

	const [ selectedKeyToRemove, setSelectedKeyToRemove ] =
		useState< TwoStepAuthApplicationPassword | null >( null );

	const { data: applicationPasswords } = useQuery( twoStepAuthApplicationPasswordsQuery() );

	const { mutate: deleteApplicationPassword, isPending: isDeletingApplicationPassword } =
		useMutation( deleteTwoStepAuthApplicationPasswordMutation() );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleRemove = () => {
		if ( selectedKeyToRemove ) {
			recordTracksEvent( 'calypso_dashboard_security_application_passwords_remove_password_click' );
			deleteApplicationPassword( selectedKeyToRemove.ID, {
				onSuccess: () => {
					createSuccessNotice(
						/* translators: %s is the application name */
						sprintf( __( 'Application password "%s" removed.' ), selectedKeyToRemove.name ),
						{
							type: 'snackbar',
						}
					);
				},
				onError: () => {
					createErrorNotice( __( 'Failed to remove application password.' ), {
						type: 'snackbar',
					} );
				},
				onSettled: () => {
					setSelectedKeyToRemove( null );
				},
			} );
		}
	};

	return (
		<>
			<ActionList>
				<VStack spacing={ 4 } style={ { paddingBlock: '16px' } }>
					<HStack justify="space-between" alignment="top">
						<SectionHeader
							level={ 3 }
							title={ __( 'Application passwords' ) }
							description={ createInterpolateElement(
								__(
									'Generate a custom password for each third-party application you authorize to use your WordPress.com account. <learnMoreLink />'
								),
								{
									learnMoreLink: (
										<InlineSupportLink
											supportPostId={ 263616 }
											supportLink={ localizeUrl(
												'https://wordpress.com/support/security/two-step-authentication/application-specific-passwords'
											) }
										/>
									),
								}
							) }
						/>
						<VStack style={ { flexShrink: 0 } }>
							<Button
								variant="secondary"
								size="compact"
								onClick={ () => {
									setIsAddApplicationPasswordModalOpen( true );
									recordTracksEvent(
										'calypso_dashboard_security_application_passwords_add_password_modal_open'
									);
								} }
							>
								{ __( 'Add application password' ) }
							</Button>
						</VStack>
					</HStack>
				</VStack>
				{ applicationPasswords?.map( ( item ) => (
					<ApplicationPasswordsList
						key={ item.ID }
						item={ item }
						onRemove={ () => setSelectedKeyToRemove( item ) }
					/>
				) ) }
			</ActionList>
			{ isAddApplicationPasswordModalOpen && (
				<RegisterApplicationPassword
					onClose={ () => setIsAddApplicationPasswordModalOpen( false ) }
				/>
			) }
			<ConfirmModal
				isOpen={ !! selectedKeyToRemove }
				confirmButtonProps={ {
					label: __( 'Remove application password' ),
					isBusy: isDeletingApplicationPassword,
					disabled: isDeletingApplicationPassword,
				} }
				onCancel={ () => setSelectedKeyToRemove( null ) }
				onConfirm={ handleRemove }
			>
				{ __( 'Are you sure you want to remove this application password?' ) }
			</ConfirmModal>
		</>
	);
}
