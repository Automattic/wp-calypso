import { Button, Spinner } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import { useSSHKeyQuery } from 'calypso/me/security-ssh-key/use-ssh-key-query';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import SshKeyCard from './ssh-key-card';
import { useAtomicSshKeys } from './use-atomic-ssh-keys';
import { useAttachSshKeyMutation } from './use-attach-ssh-key';

import './ssh-keys.scss';

interface SshKeysProps {
	siteId: number;
	siteSlug: string;
	username: string;
	disabled: boolean;
}

const noticeOptions = {
	duration: 3000,
};

const sshKeyAttachFailureNoticeId = 'ssh-key-attach-failure';

function SshKeys( { siteId, siteSlug, username, disabled }: SshKeysProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const {
		data: keys,
		isLoading: isLoadingKeys,
		isFetching: isFetchingKeys,
	} = useAtomicSshKeys( siteId, {
		enabled: ! disabled,
	} );
	const { data: userKeys, isLoading: isLoadingUserKeys } = useSSHKeyQuery();
	const { attachSshKey, isPending: attachingKey } = useAttachSshKeyMutation( siteId, {
		onMutate: () => {
			dispatch( removeNotice( sshKeyAttachFailureNoticeId ) );
		},
		onSuccess: () => {
			dispatch( recordTracksEvent( 'calypso_hosting_configuration_ssh_key_attach_success' ) );
			dispatch( successNotice( __( 'SSH key attached to site.' ), noticeOptions ) );
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_configuration_ssh_key_attach_failure', {
					code: error.code,
				} )
			);
			dispatch(
				errorNotice(
					// translators: "reason" is why adding the ssh key failed.
					sprintf( __( 'Failed to attach SSH key: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
						id: sshKeyAttachFailureNoticeId,
					}
				)
			);
		},
	} );

	const [ selectedKey, setSelectedKey ] = useState( 'default' );
	function onChangeSelectedKey( event: React.ChangeEvent< HTMLSelectElement > ) {
		setSelectedKey( event.target.value );
	}

	const userKeyIsAttached = useMemo( () => {
		if ( ! keys ) {
			return false;
		}
		return !! keys.find( ( { user_login } ) => user_login === username );
	}, [ keys, username ] );

	const isUntangled = useRemoveDuplicateViewsExperimentEnabled();

	const isLoading = isLoadingKeys || isLoadingUserKeys;
	const showKeysSelect = ! isLoading && ! userKeyIsAttached && userKeys && userKeys.length > 0;
	const showLinkToAddUserKey = ! isLoading && ! userKeyIsAttached && userKeys?.length === 0;
	const SSH_ADD_URL = addQueryArgs( '/me/security/ssh-key', {
		source: isUntangled ? 'sites/settings/sftp-ssh' : 'hosting-config',
		siteSlug,
	} );

	return (
		<div className="ssh-keys">
			<label htmlFor="attach-ssh-key" className="form-label">
				{ __( 'SSH keys' ) }
			</label>

			{ keys && keys.length > 0 && (
				<div className="ssh-keys__cards-container">
					{ keys.map( ( sshKey ) => (
						<SshKeyCard
							key={ sshKey.sha256 }
							sshKey={ sshKey }
							deleteText={ __( 'Detach' ) }
							siteId={ siteId }
							disabled={ isFetchingKeys }
						/>
					) ) }
				</div>
			) }

			{ isLoading && <Spinner /> }

			{ showKeysSelect && (
				<FormFieldset className="ssh-keys__form">
					<FormSelect
						id="attach-ssh-key"
						className="ssh-keys__select"
						onChange={ onChangeSelectedKey }
						value={ selectedKey }
					>
						{ userKeys?.map( ( key ) => (
							<option value={ key.name } key={ key.sha256 }>
								{ username }-{ key.name }
							</option>
						) ) }
					</FormSelect>
					<Button
						primary
						onClick={ () => attachSshKey( { name: selectedKey } ) }
						disabled={ attachingKey }
						busy={ attachingKey }
					>
						<span>{ __( 'Attach SSH key to site' ) }</span>
					</Button>
				</FormFieldset>
			) }
			{ showLinkToAddUserKey && (
				<div>
					{ createInterpolateElement(
						__( '<a>Add an SSH key</a> and attach it to your site to enable passwordless login.' ),
						{
							a: (
								<a
									href={ SSH_ADD_URL }
									onClick={ () => {
										dispatch(
											recordTracksEvent( 'calypso_hosting_configuration_add_ssh_key_link_click' )
										);
									} }
								/>
							),
						}
					) }
				</div>
			) }
		</div>
	);
}

export default connect( ( state ) => {
	return {
		username: getCurrentUserName( state ),
	};
} )( SshKeys );
