/* eslint-disable no-nested-ternary */
import { PLAN_BUSINESS, PLAN_ECOMMERCE, getPlan } from '@automattic/calypso-products';
import { Button, CompactCard, Dialog, LoadingPlaceholder } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import { useDispatch, useSelector } from 'calypso/state';
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

const SSHKeyLoadingPlaceholder = styled( LoadingPlaceholder )< { width?: string } >`
	:not( :last-child ) {
		margin-block-end: 0.5rem;
	}
	width: ${ ( props ) => ( props.width ? props.width : '100%' ) };
`;
interface SecuritySSHKeyQueryParams {
	siteSlug?: string;
	source?: string;
}
interface SecuritySSHKeyProps {
	queryParams: SecuritySSHKeyQueryParams;
}

const Placeholders = () => (
	<CompactCard>
		<SSHKeyLoadingPlaceholder width="18%" />
		<SSHKeyLoadingPlaceholder width="45%" />
		<SSHKeyLoadingPlaceholder width="25%" />
	</CompactCard>
);

const noticeOptions = {
	duration: 3000,
};

const sshKeySaveFailureNoticeId = 'ssh-key-save-failure';
const sshKeyUpdateFailureNoticeId = 'ssh-key-update-failure';

const UpdateSSHModalTitle = styled.h1( {
	margin: '0 0 16px',
} );

const UpdateSSHModalDescription = styled.div( {
	margin: '0 0 16px',
} );

const CancelDialogButton = styled( Button )( {
	marginInlineStart: '10px',
} );

const UpdateSSHDialogContainer = styled.div( {
	width: '900px',
	maxWidth: '100%',
} );

export const SecuritySSHKey = ( { queryParams }: SecuritySSHKeyProps ) => {
	const { data, isLoading } = useSSHKeyQuery();
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const [ sshKeyNameToUpdate, setSSHKeyNameToUpdate ] = useState( '' );
	const [ oldSSHFingerprint, setOldSSHFingerprint ] = useState( '' );
	const [ showDialog, setShowDialog ] = useState( false );
	const { __ } = useI18n();

	const { addSSHKey, isPending: isAdding } = useAddSSHKeyMutation( {
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

	const { updateSSHKey, isPending: keyBeingUpdated } = useUpdateSSHKeyMutation( {
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
		queryParams.source && queryParams.source === 'hosting-config' && queryParams.siteSlug;
	const redirectToTools =
		queryParams.source && queryParams.source === 'sites/tools/sftp-ssh' && queryParams.siteSlug;

	const closeDialog = () => setShowDialog( false );

	return (
		<Main wideLayout className="security">
			<PageViewTracker path="/me/security/ssh-key" title="Me > SSH Key" />
			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

			<NavigationHeader navigationItems={ [] } title={ __( 'Security' ) } />

			<HeaderCake
				backText={ __( 'Back' ) }
				backHref={
					redirectToHosting || redirectToTools
						? `/${ queryParams.source }/${ queryParams.siteSlug }`
						: '/me/security'
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
						{ sprintf(
							// translators: %1$s is the short-form name of the Business plan, %2$s is the short-form name of the eCommerce plan.
							__(
								'Once added, attach the SSH key to a site with a %1$s or %2$s plan to enable SSH key authentication for that site.'
							),
							getPlan( PLAN_BUSINESS )?.getTitle() || '',
							getPlan( PLAN_ECOMMERCE )?.getTitle() || ''
						) }
					</p>
					<p style={ isLoading || hasKeys ? { marginBlockEnd: 0 } : undefined }>
						{ createInterpolateElement(
							__(
								'If the SSH key is removed from your WordPress.com account, it will also be removed from all attached sites. <a>Read more.</a>'
							),
							{
								br: <br />,
								a: (
									<InlineSupportLink
										supportPostId={ 100385 }
										supportLink={ localizeUrl(
											'https://developer.wordpress.com/docs/developer-tools/ssh/'
										) }
										showIcon={ false }
									/>
								),
							}
						) }
					</p>
				</div>

				{ currentUser?.username && (
					<Dialog isVisible={ showDialog } onClose={ closeDialog } showCloseIcon shouldCloseOnEsc>
						<UpdateSSHDialogContainer>
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
							>
								<CancelDialogButton disabled={ keyBeingUpdated } onClick={ closeDialog }>
									Cancel
								</CancelDialogButton>
							</UpdateSSHKeyForm>
						</UpdateSSHDialogContainer>
					</Dialog>
				) }
				{ ! isLoading && ! hasKeys ? (
					<AddSSHKeyForm
						addSSHKey={ ( { name, key } ) => addSSHKey( { name, key } ) }
						isAdding={ isAdding }
					/>
				) : null }
			</CompactCard>
			{ isLoading && <Placeholders /> }
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
