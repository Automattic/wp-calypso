import { Button, Card } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { useDispatch } from 'react-redux';
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
		<Card className="ssh-keys-card">
			<div className="ssh-keys-card__info">
				<span className="ssh-keys-card__name">
					{ user_login }-{ name }
				</span>
				<code className="ssh-keys-card__fingerprint">{ sha256 }</code>
				<span className="ssh-keys-card__date">
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
				</span>
			</div>
			<div className="ssh-keys-card__actions">
				<Button
					scary
					onClick={ () => detachSshKey( { user_login, name } ) }
					busy={ isLoading }
					disabled={ isLoading }
				>
					{ deleteText }
				</Button>
			</div>
		</Card>
	);
}

export default SshKeyCard;
