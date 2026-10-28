import { DotcomPlans, getPlanNames } from '@automattic/api-core';
import { deleteSshKeyMutation, sshKeysQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import SnackbarBackButton from '../../app/snackbar-back-button';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ActionList } from '../../components/action-list';
import ConfirmModal from '../../components/confirm-modal';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { MAX_SSH_KEYS } from '../../utils/ssh';
import AddSshKeyModal from './add-ssh-key-modal';
import EditSshKeyModal from './edit-ssh-key-modal';
import SshKeyItem from './ssh-key-item';
import type { UserSshKey } from '@automattic/api-core';

function getDeleteConfirmationMessage( sshKey: UserSshKey ) {
	const siteCount = sshKey.site_ids?.length ?? 0;

	if ( ! siteCount ) {
		return sprintf(
			/* translators: %s is the SSH key label. */
			__( 'Are you sure you want to delete the SSH key “%s”?' ),
			sshKey.label
		);
	}

	return sprintf(
		/* translators: %1$s is the SSH key label, %2$s is the number of sites. */
		_n(
			'Are you sure you want to delete the SSH key “%1$s”? It will be detached from %2$s site.',
			'Are you sure you want to delete the SSH key “%1$s”? It will be detached from %2$s sites.',
			siteCount
		),
		sshKey.label,
		formatNumber( siteCount )
	);
}

export default function SshKeys() {
	const { recordTracksEvent } = useAnalytics();
	const { data: sshKeys } = useSuspenseQuery( sshKeysQuery() );
	const keyCount = sshKeys.length;
	const hasReachedLimit = keyCount >= MAX_SSH_KEYS;

	const [ isAddModalOpen, setIsAddModalOpen ] = useState( false );
	const [ sshKeyToEdit, setSshKeyToEdit ] = useState< UserSshKey | null >( null );
	const [ sshKeyToDelete, setSshKeyToDelete ] = useState< UserSshKey | null >( null );

	const { mutate: deleteSshKey, isPending: isDeletingSshKey } = useMutation(
		withSnackbar( deleteSshKeyMutation(), {
			success: __( 'SSH key deleted.' ),
			error: { source: 'server' },
		} )
	);

	const handleAdd = () => {
		recordTracksEvent( 'calypso_dashboard_security_ssh_key_add_click', { key_count: keyCount } );
		setIsAddModalOpen( true );
	};

	const handleEdit = ( sshKey: UserSshKey ) => {
		recordTracksEvent( 'calypso_dashboard_security_ssh_key_edit_click', { key_count: keyCount } );
		setSshKeyToEdit( sshKey );
	};

	const handleDeleteDialogOpen = ( sshKey: UserSshKey ) => {
		recordTracksEvent( 'calypso_dashboard_security_ssh_key_remove_dialog_open', {
			key_count: keyCount,
		} );
		setSshKeyToDelete( sshKey );
	};

	const handleDelete = () => {
		if ( ! sshKeyToDelete || isDeletingSshKey ) {
			return;
		}
		recordTracksEvent( 'calypso_dashboard_security_ssh_key_remove_click', {
			key_count: keyCount,
		} );
		deleteSshKey( sshKeyToDelete.name, {
			onSettled: () => {
				setSshKeyToDelete( null );
			},
		} );
	};

	const description = createInterpolateElement(
		sprintf(
			/* translators: %(businessPlan)s is the name of the Business plan, %(commercePlan)s is the name of the Commerce plan */
			__(
				'Attach your SSH keys to sites with a %(businessPlan)s or %(commercePlan)s plan to enable SSH key authentication for those sites. Deleting an SSH key also removes it from all attached sites. <learnMoreLink />'
			),
			{
				businessPlan: getPlanNames()[ DotcomPlans.BUSINESS ],
				commercePlan: getPlanNames()[ DotcomPlans.ECOMMERCE ],
			}
		),
		{
			learnMoreLink: (
				<InlineSupportLink
					supportPostId={ 100385 }
					supportLink={ localizeUrl( 'https://developer.wordpress.com/docs/developer-tools/ssh/' ) }
				/>
			),
		}
	);

	return (
		<>
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 2 } /> }
						title={ __( 'SSH keys' ) }
						description={ description }
					/>
				}
			>
				<ActionList>
					<VStack spacing={ 4 } style={ { paddingBlock: '16px' } }>
						<HStack justify="space-between" alignment="top">
							<SectionHeader
								level={ 3 }
								title={ __( 'Your SSH keys' ) }
								description={
									hasReachedLimit
										? sprintf(
												/* translators: %s is the maximum number of SSH keys. */
												__( 'You can add up to %s SSH keys. Delete a key to add another one.' ),
												formatNumber( MAX_SSH_KEYS )
											)
										: __(
												'Add an SSH key to your WordPress.com account to make it available for SFTP and SSH authentication.'
											)
								}
							/>
							<VStack style={ { flexShrink: 0 } }>
								<Button
									__next40pxDefaultSize
									variant="secondary"
									size="compact"
									onClick={ handleAdd }
									disabled={ hasReachedLimit }
									accessibleWhenDisabled
								>
									{ __( 'Add SSH key' ) }
								</Button>
							</VStack>
						</HStack>
					</VStack>
					{ sshKeys.map( ( sshKey ) => (
						<SshKeyItem
							key={ sshKey.name }
							sshKey={ sshKey }
							onEdit={ () => handleEdit( sshKey ) }
							onDelete={ () => handleDeleteDialogOpen( sshKey ) }
						/>
					) ) }
				</ActionList>
			</PageLayout>
			{ isAddModalOpen && (
				<AddSshKeyModal keyCount={ keyCount } onClose={ () => setIsAddModalOpen( false ) } />
			) }
			{ sshKeyToEdit && (
				<EditSshKeyModal
					sshKey={ sshKeyToEdit }
					keyCount={ keyCount }
					onClose={ () => setSshKeyToEdit( null ) }
				/>
			) }
			<ConfirmModal
				isOpen={ !! sshKeyToDelete }
				confirmButtonProps={ {
					label: __( 'Delete SSH key' ),
					isBusy: isDeletingSshKey,
					disabled: isDeletingSshKey,
					isDestructive: true,
				} }
				onCancel={ () => setSshKeyToDelete( null ) }
				onConfirm={ handleDelete }
			>
				{ sshKeyToDelete && getDeleteConfirmationMessage( sshKeyToDelete ) }
			</ConfirmModal>
			<SnackbarBackButton />
		</>
	);
}
