/* eslint-disable no-nested-ternary */
import { CompactCard, Dialog, LoadingPlaceholder } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getQueryArgs } from 'calypso/lib/query-args';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { AddSSHKeyForm } from './add-ssh-key-form';
import { ManageSSHKeys } from './manage-ssh-keys';
import { UpdateSSHKeyForm } from './update-ssh-key-form';
import { useAddSSHKeyMutation } from './use-add-ssh-key-mutation';
import { useDeleteSSHKeyMutation } from './use-delete-ssh-key-mutation';
import { useSSHKeyQuery } from './use-ssh-key-query';
import { useUpdateSSHKeyMutation } from './use-update-ssh-key-mutation';

const SSHKeyLoadingPlaceholder = styled( LoadingPlaceholder )( {
	':not(:last-child)': {
		marginBlockEnd: '0.5rem',
	},
} );

const Placeholders = () => (
	<>
		{ Array( 5 )
			.fill( null )
			.map( ( _, i ) => (
				<SSHKeyLoadingPlaceholder key={ i } />
			) ) }
	</>
);

const noticeOptions = {
	duration: 3000,
};

const sshKeySaveFailureNoticeId = 'ssh-key-save-failure';
const sshKeyUpdateFailureNoticeId = 'ssh-key-update-failure';

const UpdateSSHModalTitle = styled.h1`
	margin: 0 0 16px;
`;

const UpdateSSHModalDescription = styled.div`
	margin: 0 0 16px;
`;

export const SecuritySSHKey = () => {
	const { data, isLoading } = useSSHKeyQuery();
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const [ sshKeyNameToUpdate, setSSHKeyNameToUpdate ] = useState( '' );
	const [ oldSSHFingerprint, setOldSSHFingerprint ] = useState( '' );
	const [ showDialog, setShowDialog ] = useState( false );

	const { __ } = useI18n();
	const queryArgs = getQueryArgs();

	const { addSSHKey, isLoading: isAdding } = useAddSSHKeyMutation( {
		onMutate: () => {
			dispatch( removeNotice( sshKeySaveFailureNoticeId ) );
		},
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_security_ssh_key_add_success' ) );
			dispatch( successNotice( __( 'SSH key added to account.' ), noticeOptions ) );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_security_ssh_key_add_failure', {
					code: error.code,
				} )
			);
			dispatch(
				errorNotice(
					// translators: "reason" is why adding the ssh key failed.
					sprintf( __( 'Failed to save SSH key: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
						id: sshKeySaveFailureNoticeId,
					}
				)
			);
		},
	} );

	const { deleteSSHKey, keyBeingDeleted } = useDeleteSSHKeyMutation( {
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_security_ssh_key_delete_success' ) );
			dispatch( successNotice( __( 'SSH key removed from account.' ), noticeOptions ) );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_security_ssh_key_delete_failure', {
					code: error.code,
				} )
			);
			dispatch(
				errorNotice(
					// translators: "reason" is why deleting the ssh key failed.
					sprintf( __( 'Failed to delete SSH key: %(reason)s' ), { reason: error.message } ),
					noticeOptions
				)
			);
		},
	} );

	const { updateSSHKey, isLoading: keyBeingUpdated } = useUpdateSSHKeyMutation( {
		onMutate: () => {
			dispatch( removeNotice( sshKeyUpdateFailureNoticeId ) );
		},
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_security_ssh_key_update_success' ) );
			dispatch( successNotice( __( 'SSH key updated for account.' ), noticeOptions ) );
			setSSHKeyNameToUpdate( '' );
			setOldSSHFingerprint( '' );
			setShowDialog( false );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_security_ssh_key_update_failure', {
					code: error.code,
				} )
			);
			dispatch(
				errorNotice(
					// translators: "reason" is why adding the ssh key failed.
					sprintf( __( 'Failed to update SSH key: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
						id: sshKeyUpdateFailureNoticeId,
					}
				)
			);
		},
	} );

	const hasKeys = data && data.length > 0;
	const redirectToHosting =
		queryArgs.source && queryArgs.source === 'hosting-config' && queryArgs.siteSlug;

	return (
		<Main wideLayout className="security">
			<PageViewTracker path="/me/security/ssh-key" title="Me > SSH Key" />
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

			<FormattedHeader brandFont headerText={ __( 'Security' ) } align="left" />

			<HeaderCake
				backText={ redirectToHosting ? __( 'Back to Hosting Configuration' ) : __( 'Back' ) }
				backHref={
					redirectToHosting ? `/${ queryArgs.source }/${ queryArgs.siteSlug }` : '/me/security'
				}
			>
				{ __( 'SSH Key' ) }
			</HeaderCake>

			<DocumentHead title={ __( 'SSH Key' ) } />

			<CompactCard>
				<div>
					<p>
						{ __(
							'Add a SSH key to your WordPress.com account to make it available for SFTP and SSH authentication.'
						) }
					</p>
					<p>
						{ __(
							'Once added, attach the SSH key to a site with a Business or eCommerce plan to enable SSH key authentication for that site.'
						) }
					</p>
					<p style={ hasKeys ? { marginBlockEnd: 0 } : undefined }>
						{ createInterpolateElement(
							__(
								'If the SSH key is removed from your WordPress.com account, it will also be removed from all attached sites. <a>Read more.</a>'
							),
							{
								br: <br />,
								a: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/connect-to-ssh-on-wordpress-com/'
										) }
										target="_blank"
										rel="noreferrer"
									/>
								),
							}
						) }
					</p>
				</div>

				{ currentUser?.username && (
					<Dialog
						isVisible={ showDialog }
						onClose={ () => setShowDialog( false ) }
						showCloseIcon={ true }
						shouldCloseOnEsc={ true }
					>
						<div style={ { width: '600px' } }>
							<UpdateSSHModalTitle>{ __( 'Update SSH Key' ) }</UpdateSSHModalTitle>
							<UpdateSSHModalDescription>
								<p>
									{ __(
										'Replace your current SSH key with a new SSH key to use the new SSH key with all attached sites.'
									) }
								</p>
							</UpdateSSHModalDescription>
							<UpdateSSHKeyForm
								userLogin={ currentUser.username }
								oldSSHFingerprint={ oldSSHFingerprint }
								keyName={ sshKeyNameToUpdate }
								updateSSHKey={ updateSSHKey }
								isUpdating={ keyBeingUpdated }
								updateText={ __( 'Update SSH Key' ) }
							/>
						</div>
					</Dialog>
				) }

				{ isLoading ? (
					<Placeholders />
				) : ! hasKeys ? (
					<AddSSHKeyForm
						addSSHKey={ ( { name, key } ) => addSSHKey( { name, key } ) }
						isAdding={ isAdding }
					/>
				) : null }
			</CompactCard>
			{ hasKeys && currentUser?.username && (
				<ManageSSHKeys
					userLogin={ currentUser.username }
					sshKeys={ data }
					onDelete={ ( sshKeyName ) => deleteSSHKey( { sshKeyName } ) }
					onUpdate={ ( sshKeyName, keyFingerprint ) => {
						setSSHKeyNameToUpdate( sshKeyName );
						setOldSSHFingerprint( keyFingerprint );
						setShowDialog( true );
					} }
					keyBeingUpdated={ keyBeingUpdated }
					keyBeingDeleted={ keyBeingDeleted }
				/>
			) }
		</Main>
	);
};
