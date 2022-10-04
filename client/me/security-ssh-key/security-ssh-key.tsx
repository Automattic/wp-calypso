/* eslint-disable no-nested-ternary */
import { CompactCard, LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
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

export const SecuritySSHKey = () => {
	const { data, isLoading } = useSSHKeyQuery();
	const dispatch = useDispatch();
	const { __ } = useI18n();

	const addSSHKey = useAddSSHKeyMutation( {
		onSuccess: () => {
			dispatch( successNotice( __( 'SSH key has been successfully added!' ) ) );
		},
		onError: () => {
			dispatch(
				errorNotice( __( 'Sorry, we had a problem saving that SSH key. Please try again.' ) )
			);
		},
	} );

	const deleteSSHKey = useDeleteSSHKeyMutation( {
		onSuccess: () => {
			dispatch( successNotice( __( 'SSH key has been successfully removed!' ) ) );
		},
		onError: () => {
			dispatch(
				errorNotice( __( 'Sorry, we had a problem deleting that SSH key. Please try again.' ) )
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
					{ __(
						'Add a SSH key to connect to our servers and manage your plugin-enabled WordPress.com website via command-line tools.'
					) }
				</p>

				{ isLoading ? (
					<Placeholders />
				) : ! hasKeys ? (
					<AddSSHKeyForm addSSHKey={ ( { name, key } ) => addSSHKey( { name, key } ) } />
				) : null }
			</CompactCard>
			{ hasKeys && (
				<ManageSSHKeys
					sshKeys={ data }
					onDelete={ ( sshKeyName ) => deleteSSHKey( { sshKeyName } ) }
				/>
			) }
		</Main>
	);
};
