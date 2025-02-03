import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import { Mailbox } from 'calypso/data/emails/types';
import { getEmailAddress } from 'calypso/lib/emails';
import EmailForwardTarget from '../../email-management/home/email-plan-mailboxes/email-forward-target';
import { ActionsMenu } from '../actions-menu';
import { VerificationPendingNotice } from '../verification-notices';
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

/**
 * Truncates helloIndifferentWorld to hello...rld.
 * @param str the long string
 */
function smartTruncate( str: string ) {
	if ( str.length <= 32 ) {
		return str;
	}
	const start = str.slice( 0, 10 );
	const end = str.slice( -5 );
	return `${ start }…${ end }`;
}

function smartTruncateEmail( str: string ) {
	const [ localPart, domain ] = str.split( '@' );
	return `${ smartTruncate( localPart ) }@${ smartTruncate( domain ) }`;
}

function THead() {
	const translate = useTranslate();
	const isMobile = useMediaQuery( '(max-width: 960px)' );

	if ( isMobile ) {
		return (
			<thead className="email-forward-list__row">
				<tr>
					<th>{ translate( 'Mailbox' ) }</th>
					<th>{ translate( 'Status' ) }</th>
					<th>
						<div className="email-forward-list__actions">{ translate( 'Actions' ) }</div>
					</th>
				</tr>
			</thead>
		);
	}
	return (
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
	);
}

function TBody( { mailbox, targets }: { mailbox: string; targets: Mailbox[] } ) {
	const isMobile = useMediaQuery( '(max-width: 960px)' );
	const fromAddress = getEmailAddress( targets[ 0 ] );

	if ( isMobile ) {
		return (
			<tbody>
				<tr key={ mailbox }>
					<td colSpan={ 3 }>
						<strong title={ fromAddress }>{ smartTruncateEmail( fromAddress ) }</strong>
					</td>
				</tr>
				{ targets.map( ( mailbox ) => (
					<tr key={ mailbox.target }>
						<td>
							<EmailForwardTarget
								showIcon
								title={ mailbox.target }
								target={ smartTruncateEmail( mailbox.target ) }
							/>
						</td>
						<td>
							{ mailbox.warnings?.length ? (
								<InfoPopover>
									<VerificationPendingNotice mailbox={ mailbox } />
								</InfoPopover>
							) : (
								<VerificationPendingNotice mailbox={ mailbox } />
							) }
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
	}
	return (
		<tbody>
			{ targets.map( ( mailbox, index ) => (
				<tr key={ mailbox.mailbox + mailbox.target }>
					<td title={ fromAddress }>{ index === 0 ? smartTruncateEmail( fromAddress ) : null }</td>
					<td>
						<EmailForwardTarget
							title={ mailbox.target }
							target={ smartTruncateEmail( mailbox.target ) }
						/>
					</td>
					<td>
						<VerificationPendingNotice mailbox={ mailbox } />
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
}

export function EmailForwardsList( {
	mailboxes,
	actionPath,
}: {
	mailboxes: Mailbox[];
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
				<THead />
				{ normalizedMailboxes.map( ( [ from, targets ] ) => {
					return <TBody key={ from } mailbox={ from } targets={ targets } />;
				} ) }
			</table>
		</>
	);
}
