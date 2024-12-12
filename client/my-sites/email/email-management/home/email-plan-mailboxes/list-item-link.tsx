import { Gridicon } from '@automattic/components';
import ExternalLink from 'calypso/components/external-link';
import { getEmailAddress, isEmailForwardAccount, isTitanMailAccount } from 'calypso/lib/emails';
import { getGmailUrl } from 'calypso/lib/gsuite';
import { getTitanEmailUrl, useTitanAppsUrlPrefix } from 'calypso/lib/titan';
import { recordEmailAppLaunchEvent } from '../utils';
import type { EmailAccount, Mailbox } from 'calypso/data/emails/types';

type Props = {
	account: EmailAccount;
	mailbox: Mailbox;
	readonly?: boolean;
};
function MailboxLink( { account, mailbox, readonly }: Props ) {
	const titanAppsUrlPrefix = useTitanAppsUrlPrefix();
	const emailAddress = getEmailAddress( mailbox );
	const isReadonly = readonly || isEmailForwardAccount( account );

	if ( isReadonly ) {
		return (
			<div className="email-plan-mailboxes-list__mailbox-list-link">
				<span>{ emailAddress }</span>
			</div>
		);
	}

	const isTitan = isTitanMailAccount( account );
	const primaryHref = isTitan
		? getTitanEmailUrl( titanAppsUrlPrefix, emailAddress, false, window.location.href )
		: getGmailUrl( emailAddress );

	return (
		<ExternalLink
			className="email-plan-mailboxes-list__mailbox-list-link"
			href={ primaryHref }
			onClick={ () => {
				recordEmailAppLaunchEvent( {
					app: isTitan ? titanAppsUrlPrefix : 'webmail',
					context: 'email-management-list',
					provider: isTitan ? 'titan' : 'google',
				} );
			} }
			target="_blank"
			rel="noopener noreferrer"
		>
			<span>{ emailAddress }</span>
			<Gridicon icon="external" size={ 18 } />
		</ExternalLink>
	);
}

export default MailboxLink;
