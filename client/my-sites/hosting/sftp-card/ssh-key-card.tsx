import { Button, Card } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import i18n from 'i18n-calypso';
import { AtomicKey } from './use-atomic-ssh-keys';
import { useDetachSshKeyMutation } from './use-detach-ssh-key';

interface SshKeyCardProps {
	deleteText: string;
	siteId: number;
	sshKey: AtomicKey;
}

function SshKeyCard( { deleteText, siteId, sshKey }: SshKeyCardProps ) {
	const { __ } = useI18n();
	const { mutate: detachSshKey, isLoading } = useDetachSshKeyMutation( { siteId } );
	const { sha256, user_name, name, created_at } = sshKey;
	return (
		<Card className="ssh-keys-card">
			<div className="ssh-keys-card__info">
				<span className="ssh-keys-card__name">{ user_name }</span>
				<code className="ssh-keys-card__fingerprint">{ sha256 }</code>
				<span className="ssh-keys-card__date">
					{ sprintf(
						// translators: addedOn is when the SSH key was added.
						__( 'Added on %(addedOn)s' ),
						{
							addedOn: new Intl.DateTimeFormat( i18n.getLocaleSlug() ?? 'en', {
								dateStyle: 'long',
								timeStyle: 'medium',
							} ).format( new Date( created_at ) ),
						}
					) }
				</span>
			</div>
			<div className="ssh-keys-card__actions">
				<Button
					scary
					onClick={ () => detachSshKey( { user_name, name } ) }
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
