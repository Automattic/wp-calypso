import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { EmailAccount, Mailbox } from 'calypso/data/emails/types';
import EmailForwardSecondaryDetails from '../../email-management/home/email-plan-mailboxes/email-forward-secondary-details';
import MailboxLink from '../../email-management/home/email-plan-mailboxes/list-item-link';
import { RemoveButton } from '../remove-button';
import { ResendButton } from '../resend-button';
import { VerificatonPendingNotice } from '../verification-notices';

import './style.scss';

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
	let lastMailbox: string = '';

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
						<th>{ translate( 'Details' ) }</th>
						<th>{ translate( 'Status' ) }</th>
						<th>
							<div className="email-forward-list__actions">{ translate( 'Actions' ) }</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{ mailboxes
						?.sort( ( a, b ) => a.mailbox.localeCompare( b.mailbox ) )
						.map( ( mailbox ) => {
							// Don't repeat the source for easier readibility.
							const shouldRenderFrom = lastMailbox !== mailbox.mailbox;
							if ( shouldRenderFrom ) {
								lastMailbox = mailbox.mailbox;
							}
							return (
								<tr key={ mailbox.mailbox } className="email-forward-list__row">
									<td>
										{ shouldRenderFrom ? (
											<MailboxLink account={ account } mailbox={ mailbox } />
										) : null }
									</td>
									<td>
										<EmailForwardSecondaryDetails mailbox={ mailbox } />
									</td>
									<td>
										<VerificatonPendingNotice warnings={ mailbox.warnings } />
									</td>
									<td>
										<div className="email-forward-list__actions">
											<ResendButton mailbox={ mailbox } />
											<RemoveButton mailbox={ mailbox } />
										</div>
									</td>
								</tr>
							);
						} ) }
				</tbody>
			</table>
		</>
	);
}
