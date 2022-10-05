/* eslint-disable no-nested-ternary */
import { CompactCard, LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { AddSSHKeyForm } from './add-ssh-key-form';
import { ManageSSHKeys } from './manage-ssh-keys';
import { useAddSSHKeyMutation } from './use-add-ssh-key-mutation';
import { useDeleteSSHKeyMutation } from './use-delete-ssh-key-mutation';
import { useSSHKeyQuery } from './use-ssh-key-query';

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

export const SecuritySSHKey = () => {
	const { data, isLoading } = useSSHKeyQuery();
	const dispatch = useDispatch();
	const { __ } = useI18n();

	const { addSSHKey, isLoading: isAdding } = useAddSSHKeyMutation( {
		onMutate: () => {
			dispatch( recordTracksEvent( 'calypso_ssh_key_add_request' ) );
			dispatch( removeNotice( sshKeySaveFailureNoticeId ) );
		},
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_ssh_key_add_success' ) );
			dispatch( successNotice( __( 'SSH key has been successfully added!' ), noticeOptions ) );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_ssh_key_add_failure', {
					code: error.code,
				} )
			);
			dispatch(
				errorNotice(
					// translators: "reason" is why adding the ssh key failed.
					sprintf( __( 'Saving SSH key failed: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
						id: sshKeySaveFailureNoticeId,
					}
				)
			);
		},
	} );

	const { deleteSSHKey, keyBeingDeleted } = useDeleteSSHKeyMutation( {
		onMutate: () => {
			dispatch( recordTracksEvent( 'calypso_ssh_key_delete_request' ) );
		},
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_ssh_key_delete_success' ) );
			dispatch( successNotice( __( 'SSH key has been successfully removed!' ), noticeOptions ) );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_ssh_key_delete_failure', {
					code: error.code,
				} )
			);
			dispatch(
				errorNotice(
					// translators: "reason" is why deleting the ssh key failed.
					sprintf( __( 'Deleting SSH key failed: %(reason)s' ), { reason: error.message } ),
					noticeOptions
				)
			);
		},
	} );

	const hasKeys = data && data.length > 0;

	return (
		<Main wideLayout className="security">
			<PageViewTracker path="/me/security/ssh-key" title="Me > SSH Key" />

			<FormattedHeader brandFont headerText={ __( 'Security' ) } align="left" />

			<HeaderCake backText={ __( 'Back' ) } backHref="/me/security">
				{ __( 'SSH Key' ) }
			</HeaderCake>

			<DocumentHead title={ __( 'SSH Key' ) } />

			<CompactCard>
				<p style={ hasKeys ? { marginBlockEnd: 0 } : undefined }>
					{ createInterpolateElement(
						__(
							'Add a SSH key to manage your SSH-enabled WordPress.com website via command-line tools. Site-level Business plan is required to connect with SSH keys. <a>Read more.</a>'
						),
						{
							a: (
								<a
									href="https://wordpress.com/support/connect-to-ssh-on-wordpress-com/"
									target="_blank"
									rel="noreferrer"
								/>
							),
						}
					) }
				</p>

				{ isLoading ? (
					<Placeholders />
				) : ! hasKeys ? (
					<AddSSHKeyForm
						addSSHKey={ ( { name, key } ) => addSSHKey( { name, key } ) }
						isAdding={ isAdding }
					/>
				) : null }
			</CompactCard>
			{ hasKeys && (
				<ManageSSHKeys
					sshKeys={ data }
					onDelete={ ( sshKeyName ) => deleteSSHKey( { sshKeyName } ) }
					keyBeingDeleted={ keyBeingDeleted }
				/>
			) }
		</Main>
	);
};
