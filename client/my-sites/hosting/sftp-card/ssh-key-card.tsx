import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import * as SSHKeyCard from 'calypso/components/ssh-key-card';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { AtomicKey } from './use-atomic-ssh-keys';
import { useDetachSshKeyMutation } from './use-detach-ssh-key';

interface SshKeyCardProps {
	deleteText: string;
	siteId: number;
	sshKey: AtomicKey;
}

const noticeOptions = {
	duration: 3000,
};

const sshKeyDetachFailureNoticeId = 'ssh-key-detach-failure';

function SshKeyCard( { deleteText, siteId, sshKey }: SshKeyCardProps ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const { detachSshKey, isLoading } = useDetachSshKeyMutation(
		{ siteId },
		{
			onMutate: () => {
				dispatch( removeNotice( sshKeyDetachFailureNoticeId ) );
			},
			onSuccess: () => {
				dispatch( recordTracksEvent( 'calypso_hosting_configuration_ssh_key_detach_success' ) );
				dispatch( successNotice( __( 'SSH key detached from site.' ), noticeOptions ) );
			},
			onError: ( error ) => {
				dispatch(
					recordTracksEvent( 'calypso_hosting_configuration_ssh_key_detach_failure', {
						code: error.code,
					} )
				);
				dispatch(
					errorNotice(
						// translators: "reason" is why adding the ssh key failed.
						sprintf( __( 'Failed to detach SSH key: %(reason)s' ), { reason: error.message } ),
						{
							...noticeOptions,
							id: sshKeyDetachFailureNoticeId,
						}
					)
				);
			},
		}
	);
	const { sha256, user_login, name, attached_at } = sshKey;
	return (
		<SSHKeyCard.Root className="ssh-keys-card">
			<SSHKeyCard.Details>
				<SSHKeyCard.KeyName>
					{ user_login }-{ name }
				</SSHKeyCard.KeyName>
				<SSHKeyCard.PublicKey>{ sha256 }</SSHKeyCard.PublicKey>
				<SSHKeyCard.Date>
					{ sprintf(
						// translators: attachedOn is when the SSH key was attached.
						__( 'Attached on %(attachedOn)s' ),
						{
							attachedOn: new Intl.DateTimeFormat( i18n.getLocaleSlug() ?? 'en', {
								dateStyle: 'long',
								timeStyle: 'medium',
							} ).format( new Date( attached_at ) ),
						}
					) }
				</SSHKeyCard.Date>
			</SSHKeyCard.Details>
			<SSHKeyCard.Button
				onClick={ () => detachSshKey( { user_login, name } ) }
				busy={ isLoading }
				disabled={ isLoading }
			>
				{ deleteText }
			</SSHKeyCard.Button>
		</SSHKeyCard.Root>
	);
}

export default SshKeyCard;
