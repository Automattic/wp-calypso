import { Gridicon } from '@automattic/components';
import { getEmailForwardAddress, isEmailForward } from 'calypso/lib/emails';
import type { Mailbox } from 'calypso/data/emails/types';

type Props = {
	mailbox: Mailbox;
};
function EmailForwardSecondaryDetails( { mailbox }: Props ) {
	if ( isEmailForward( mailbox ) ) {
		return (
			<div className="email-plan-mailboxes-list__mailbox-secondary-details">
				<Gridicon icon="chevron-right" />
				<span>{ getEmailForwardAddress( mailbox ) }</span>
			</div>
		);
	}

	return null;
}

export default EmailForwardSecondaryDetails;
