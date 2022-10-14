import { Button, Card } from '@automattic/components';
import { useDetachSshKeyMutation } from './use-detach-ssh-key';

interface SshKeyCardProps {
	name: string;
	fingerprint: string;
	deleteText: string;
	siteId: number;
	userId: number | null;
}

function SshKeyCard( { name, fingerprint, deleteText, siteId, userId }: SshKeyCardProps ) {
	const { mutate: detachSshKey, isLoading } = useDetachSshKeyMutation( { siteId, userId } );
	return (
		<Card className="ssh-keys-card">
			<div className="ssh-keys-card__info">
				<span className="ssh-keys-card__name">{ name }</span>
				<code className="ssh-keys-card__fingerprint">{ fingerprint }</code>
			</div>
			<div className="ssh-keys-card__actions">
				<Button
					scary
					onClick={ () => detachSshKey( { name } ) }
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
