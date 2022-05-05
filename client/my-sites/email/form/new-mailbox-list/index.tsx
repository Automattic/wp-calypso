import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import CardHeading from 'calypso/components/card-heading';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import {
	FIELD_FIRSTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_UUID,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import {
	getFormField,
	getFormFieldValue,
} from 'calypso/my-sites/email/form/mailboxes/field-selectors';
import NewMailbox from 'calypso/my-sites/email/form/new-mailbox-list/new-mailbox';
import { sanitizeMailboxValue } from 'calypso/my-sites/email/form/new-mailbox-list/sanitize-mailbox-value';
import type { EmailProvider, FormFieldNames } from 'calypso/my-sites/email/form/mailboxes/types';
import type { SiteDomain } from 'calypso/state/sites/domains/types';
import type { ReactNode } from 'react';

interface NewMailboxListProps {
	children?: ReactNode;
	domains?: SiteDomain[];
	hiddenFieldNames: FormFieldNames[];
	mailboxes: MailboxForm< EmailProvider >[];
	onMailboxesChange: ( mailboxes: MailboxForm< EmailProvider >[] ) => void;
	onReturnKeyPress: ( event: Event ) => void;
	provider: EmailProvider;
	selectedDomainName: string;
	showAddAnotherMailboxButton?: boolean;
	submitAttempted?: boolean;
	validatedMailboxUuids?: string[];
}

const NewMailboxList = ( {
	children,
	domains,
	hiddenFieldNames = [],
	mailboxes = [],
	onMailboxesChange,
	onReturnKeyPress,
	provider,
	selectedDomainName,
	showAddAnotherMailboxButton = false,
	submitAttempted = false,
	validatedMailboxUuids = [],
}: NewMailboxListProps ): JSX.Element => {
	const translate = useTranslate();

	mailboxes.forEach( ( mailbox ) => {
		hiddenFieldNames.forEach( ( hiddenFieldName ) =>
			mailbox.setFieldIsVisible( hiddenFieldName, false )
		);
	} );

	const onMailboxValueChange =
		( uuid: string ) =>
		(
			fieldName: FormFieldNames,
			fieldValue: string | boolean,
			mailBoxFieldTouched = false
		): void => {
			const updatedMailboxes = mailboxes.map( ( mailbox ) => {
				if ( getFormFieldValue( mailbox, FIELD_UUID ) !== uuid ) {
					return mailbox;
				}

				const formField = getFormField( mailbox, fieldName );
				formField.value = fieldValue;

				if ( [ FIELD_FIRSTNAME, FIELD_NAME ].includes( fieldName ) && ! mailBoxFieldTouched ) {
					const mailboxField = getFormField( mailbox, FIELD_MAILBOX );
					if ( mailboxField ) {
						mailboxField.value = sanitizeMailboxValue( fieldValue as string );
					}
				}

				mailbox.validate();

				return mailbox;
			} );

			onMailboxesChange( updatedMailboxes );
		};

	const onMailboxAdd = (): void => {
		onMailboxesChange( [
			...mailboxes,
			new MailboxForm< EmailProvider >( provider, selectedDomainName ),
		] );
	};

	const onMailboxRemove =
		( currentMailboxes: MailboxForm< EmailProvider >[], uuid: string ) => () => {
			const remainingMailboxes = currentMailboxes.filter(
				( mailbox ) => getFormFieldValue( mailbox, FIELD_UUID ) !== uuid
			);

			const updatedMailboxes =
				0 < remainingMailboxes.length
					? remainingMailboxes
					: [ new MailboxForm< EmailProvider >( provider, selectedDomainName ) ];

			onMailboxesChange( updatedMailboxes );
		};

	return (
		<div className="new-mailbox-list__main">
			{ mailboxes.map( ( mailbox, index ) => (
				<Fragment key={ `${ index }:${ getFormFieldValue( mailbox, FIELD_UUID ) }` }>
					{ index > 0 && (
						<CardHeading className="new-mailbox-list__numbered-heading" tagName="h3" size={ 20 }>
							{ translate( 'Mailbox %(position)s', {
								args: { position: index + 1 },
								comment:
									'%(position)s is the position of the mailbox in a list, e.g. Mailbox 1, Mailbox 2, etc',
							} ) }
						</CardHeading>
					) }

					<NewMailbox
						domains={
							domains
								? domains
										.map( ( domain ) => domain.name ?? '' )
										.filter( ( domainName ) => Boolean( domainName ) )
								: [ selectedDomainName ]
						}
						onMailboxValueChange={ onMailboxValueChange(
							getFormFieldValue( mailbox, FIELD_UUID ) as string
						) }
						mailbox={ mailbox }
						onReturnKeyPress={ onReturnKeyPress }
						provider={ provider }
						selectedDomainName={ selectedDomainName }
						showAllErrors={ validatedMailboxUuids.includes(
							getFormFieldValue( mailbox, FIELD_UUID ) as string
						) }
						submitAttempted={ submitAttempted }
					/>

					<div className="new-mailbox-list__actions">
						{ index > 0 && (
							<Button
								className="new-mailbox-list__action-remove"
								onClick={ onMailboxRemove(
									mailboxes,
									getFormFieldValue( mailbox, FIELD_UUID ) as string
								) }
							>
								<Gridicon icon="trash" />
								<span>{ translate( 'Remove this mailbox' ) }</span>
							</Button>
						) }
					</div>

					<hr className="new-mailbox-list__separator" />
				</Fragment>
			) ) }

			<div className="new-mailbox-list__supplied-actions">
				{ showAddAnotherMailboxButton && (
					<Button onClick={ () => onMailboxAdd() }>
						<Gridicon icon="plus" />
						<span>{ translate( 'Add another mailbox' ) }</span>
					</Button>
				) }
				{ children }
			</div>
		</div>
	);
};

export default NewMailboxList;
