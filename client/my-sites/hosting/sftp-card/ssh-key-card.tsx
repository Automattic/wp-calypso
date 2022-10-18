import { Button, Card } from '@automattic/components';
import { AtomicKey } from './use-atomic-ssh-keys';
import { useDetachSshKeyMutation } from './use-detach-ssh-key';

interface SshKeyCardProps {
	deleteText: string;
	siteId: number;
	sshKey: AtomicKey;
}

function SshKeyCard( { deleteText, siteId, sshKey }: SshKeyCardProps ) {
	const { mutate: detachSshKey, isLoading } = useDetachSshKeyMutation( { siteId } );
	const { sha256, user_name, name } = sshKey;
	return (
		<Card className="ssh-keys-card">
			<div className="ssh-keys-card__info">
				<span className="ssh-keys-card__name">{ user_name }</span>
				<code className="ssh-keys-card__fingerprint">{ sha256 }</code>
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
