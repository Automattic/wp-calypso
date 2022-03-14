import { useTranslate } from 'i18n-calypso';
import Spinner from 'calypso/components/spinner';
import { useGetMailboxes } from 'calypso/data/emails/use-get-mailboxes';
import { FoldableCard } from 'calypso/devdocs/design/playground-scope';
import { getEmailAddress } from 'calypso/lib/emails';
import {
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL,
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL,
} from 'calypso/lib/emails/email-provider-constants';

import './style.scss';

interface TitanExistingMailboxesProps {
	selectedDomainName: string;
	selectedSiteId: number;
	title: string;
}

interface Mailbox {
	account_type: string;
	domain: string;
	last_access_time: Date | null;
	mailbox: string;
}

export const TitanExistingMailboxes = ( {
	selectedDomainName,
	selectedSiteId,
	title,
}: TitanExistingMailboxesProps ): JSX.Element | null => {
	const translate = useTranslate();

	const { data, isLoading } = useGetMailboxes( selectedSiteId, {
		retry: 2,
	} );

	const summary = isLoading ? <Spinner /> : translate( 'Existing mailboxes' );

	const mailboxes = data?.mailboxes
		?.filter(
			( mailbox: Mailbox ) =>
				mailbox.domain === selectedDomainName &&
				[ EMAIL_ACCOUNT_TYPE_TITAN_MAIL, EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL ].some(
					( accountType ) => accountType === mailbox.account_type
				)
		)
		.sort( ( mailbox: Mailbox ) => mailbox.domain );

	const renderMailbox = ( mailbox: Mailbox ) => {
		return <li> { getEmailAddress( mailbox ) } </li>;
	};

	return (
		<FoldableCard
			className="titan-existing-mailboxes__header"
			compact
			header={ title }
			screenReaderText={ translate( 'See existing mailboxes' ) }
			summary={ summary }
		>
			{ mailboxes?.map( ( mailbox: Mailbox ) => (
				<ul> { renderMailbox( mailbox ) } </ul>
			) ) }
		</FoldableCard>
	);
};
