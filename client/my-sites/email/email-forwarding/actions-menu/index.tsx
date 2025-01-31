import './style.scss';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import { RemoveButton } from '../remove-button';
import { ResendButton } from '../resend-button';
import type { Mailbox } from '../../../../data/emails/types';

export function ActionsMenu( { mailbox }: { mailbox: Mailbox } ) {
	return (
		<EllipsisMenu position="bottom">
			<RemoveButton mailbox={ mailbox } />
			<ResendButton mailbox={ mailbox } />
		</EllipsisMenu>
	);
}
