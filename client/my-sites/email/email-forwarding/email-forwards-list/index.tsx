import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { EmailAccount, Mailbox } from 'calypso/data/emails/types';
import EmailForwardSecondaryDetails from '../../email-management/home/email-plan-mailboxes/email-forward-secondary-details';
import MailboxLink from '../../email-management/home/email-plan-mailboxes/list-item-link';
import { ActionsMenu } from '../actions-menu';
import { VerificatonPendingNotice } from '../verification-notices';
import './style.scss';

function groupByMailbox( mailboxes: Mailbox[] ) {
	return Object.entries(
		mailboxes.reduce(
			( groups, mailbox ) => {
				const mailboxGroup = groups[ mailbox.mailbox ] || [];
				mailboxGroup.push( mailbox );
				groups[ mailbox.mailbox ] = mailboxGroup;
				return groups;
			},
			{} as Record< string, Mailbox[] >
		)
	);
}

export function EmailForwardsList( {
	mailboxes,
	account,
	actionPath,
}: {
	mailboxes: Mailbox[];
	account: EmailAccount;
	actionPath: string | undefined;
} ) {
	const translate = useTranslate();
	const normalizedMailboxes = groupByMailbox( mailboxes );

	return (
		<>
			<div className="email-forwards-list__header">
				<h2>{ translate( 'Email forwards' ) }</h2>
				{ actionPath && (
					<Button href={ actionPath } variant="primary">
						{ translate( 'Add forward' ) }
					</Button>
				) }
			</div>
			<table className="email-forward-list">
				<thead className="email-forward-list__row">
					<tr>
						<th>{ translate( 'Mailbox' ) }</th>
						<th>{ translate( 'To' ) }</th>
						<th>{ translate( 'Status' ) }</th>
						<th>
							<div className="email-forward-list__actions">{ translate( 'Actions' ) }</div>
						</th>
					</tr>
				</thead>
				{ normalizedMailboxes.map( ( [ from, mailboxes ] ) => {
					return (
						<tbody key={ from }>
							{ mailboxes.map( ( mailbox, index ) => (
								<tr key={ mailbox.mailbox + mailbox.target }>
									<td>
										{ index === 0 ? <MailboxLink account={ account } mailbox={ mailbox } /> : null }
									</td>
									<td>
										<EmailForwardSecondaryDetails mailbox={ mailbox } />
									</td>
									<td>
										<VerificatonPendingNotice warnings={ mailbox.warnings } />
									</td>
									<td>
										<div className="email-forward-list__actions">
											<ActionsMenu mailbox={ mailbox } />
										</div>
									</td>
								</tr>
							) ) }
						</tbody>
					);
				} ) }
			</table>
		</>
	);
}
