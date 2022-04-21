import { useTranslate } from 'i18n-calypso';
import {
	FIELD_FIRSTNAME,
	FIELD_UUID,
} from 'calypso/my-sites/email/email-provider-new-mailbox-list/constants';
import {
	getNewMailbox,
	sanitizeValueForEmail,
	validateMailboxes,
} from 'calypso/my-sites/email/email-provider-new-mailbox-list/utilities';
import type { Mailbox } from 'calypso/my-sites/email/email-provider-new-mailbox-list/types';
import type { SiteDomain } from 'calypso/state/sites/domains/types';
import type { ReactElement, ReactNode } from 'react';

interface EmailProviderNewMailboxListProps {
	autoFocus?: boolean;
	children?: ReactNode;
	domains?: SiteDomain[];
	extraValidation: ( mailbox: Mailbox ) => Mailbox;
	hiddenFieldNames: string[];
	mailboxes: Mailbox[];
	onMailboxesChange: ( mailboxes: Mailbox[] ) => void;
	onReturnKeyPress: ( event: Event ) => void;
	selectedDomainName: string;
	showAddAnotherMailboxButton?: boolean;
	validatedMailboxUuids?: string[];
}

const EmailProviderNewMailboxList = ( {
	autoFocus = false,
	children,
	domains,
	extraValidation,
	hiddenFieldNames = [],
	mailboxes = [],
	onMailboxesChange,
	onReturnKeyPress,
	selectedDomainName,
	showAddAnotherMailboxButton = true,
	validatedMailboxUuids = [],
}: EmailProviderNewMailboxListProps ): ReactElement => {
	const translate = useTranslate();

	const onMailboxValueChange = ( uuid: string ) => (
		fieldName: string,
		fieldValue: string,
		mailBoxFieldTouched = false
	) => {
		const updatedMailboxes = mailboxes.map( ( mailbox ) => {
			if ( mailbox[ FIELD_UUID ] !== uuid ) {
				return mailbox;
			}

			const updatedMailbox = { ...mailbox, [ fieldName ]: { value: fieldValue, error: null } };

			if ( FIELD_FIRSTNAME === fieldName && ! mailBoxFieldTouched ) {
				return {
					...updatedMailbox,
					mailBox: { value: sanitizeValueForEmail( fieldValue ), error: null },
				};
			}

			return updatedMailbox;
		} );

		onMailboxesChange( validateMailboxes( updatedMailboxes, hiddenFieldNames, extraValidation ) );
	};

	const onMailboxAdd = () => {
		onMailboxesChange( [ ...mailboxes, getNewMailbox( selectedDomainName ) ] );
	};

	const onMailboxRemove = ( currentMailboxes: Mailbox[], uuid: string ) => () => {
		const remainingMailboxes = currentMailboxes.filter(
			( mailbox ) => mailbox[ FIELD_UUID ] !== uuid
		);

		const updatedMailboxes =
			0 < remainingMailboxes.length ? remainingMailboxes : [ getNewMailbox( selectedDomainName ) ];

		onMailboxesChange( updatedMailboxes );
	};

	return <></>;
};

export default EmailProviderNewMailboxList;
