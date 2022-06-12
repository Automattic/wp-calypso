import { Button, Gridicon } from '@automattic/components';
import { Fragment, useCallback } from '@wordpress/element';
import classNames from 'classnames';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { FormEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import { useGetEmailAccountsQuery } from 'calypso/data/emails/use-get-email-accounts-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	EMAIL_ACCOUNT_TYPE_GOOGLE_WORKSPACE,
	EMAIL_ACCOUNT_TYPE_GSUITE,
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL,
	EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL,
} from 'calypso/lib/emails/email-provider-constants';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxFormWrapper } from 'calypso/my-sites/email/form/mailboxes/components/mailbox-form-wrapper';
import { MailboxOperations } from 'calypso/my-sites/email/form/mailboxes/components/utilities/mailbox-operations';
import { sanitizeMailboxValue } from 'calypso/my-sites/email/form/mailboxes/components/utilities/sanitize-mailbox-value';
import {
	FIELD_FIRSTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import {
	EmailProvider,
	MailboxFormFieldBase,
	MutableFormFieldNames,
} from 'calypso/my-sites/email/form/mailboxes/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

interface MailboxListProps {
	areButtonsBusy?: boolean;
	hiddenFieldNames?: MutableFormFieldNames[];
	onCancel?: () => void;
	onSubmit: ( mailboxOperations: MailboxOperations ) => void;
	provider: EmailProvider;
	selectedDomainName: string;
	showAddNewMailboxButton?: boolean;
	showCancelButton?: boolean;
	submitActionText?: TranslateResult;
}

interface ExistingMailAccount {
	account_type: string;
	emails: {
		email_type: string;
		mailbox: string;
	}[];
}

const mapProviderToEmailAccountTypes = ( provider: EmailProvider ): string[] =>
	( {
		[ EmailProvider.Titan ]: [
			EMAIL_ACCOUNT_TYPE_TITAN_MAIL,
			EMAIL_ACCOUNT_TYPE_TITAN_MAIL_EXTERNAL,
		],
		[ EmailProvider.Google ]: [ EMAIL_ACCOUNT_TYPE_GOOGLE_WORKSPACE, EMAIL_ACCOUNT_TYPE_GSUITE ],
	}[ provider ] );

const useGetExistingMailboxNames = (
	provider: EmailProvider,
	selectedDomainName: string
): string[] => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const {
		data: { accounts } = {},
		error,
		isLoading,
	} = useGetEmailAccountsQuery( selectedSiteId as number, selectedDomainName );

	if ( error || isLoading || ! accounts ) {
		return [];
	}

	const emailAccountTypes = mapProviderToEmailAccountTypes( provider );

	return ( accounts as ExistingMailAccount[] )
		.filter( ( { account_type } ) => emailAccountTypes.includes( account_type ) )
		.flatMap( ( { emails } ) => emails.map( ( { mailbox } ) => mailbox ) );
};

const NewMailBoxList = (
	props: MailboxListProps & { children?: JSX.Element }
): JSX.Element | null => {
	const translate = useTranslate();

	const {
		areButtonsBusy = false,
		hiddenFieldNames = [],
		onCancel = () => undefined,
		onSubmit,
		provider,
		selectedDomainName,
		showAddNewMailboxButton = false,
		showCancelButton = false,
		submitActionText = translate( 'Submit' ),
	} = props;

	const existingMailboxes = useGetExistingMailboxNames( provider, selectedDomainName );

	const createNewMailbox = () =>
		new MailboxForm< EmailProvider >( provider, selectedDomainName, existingMailboxes );

	const [ mailboxes, setMailboxes ] = useState( [ createNewMailbox() ] );
	const isTitan = provider === EmailProvider.Titan;

	// Set visibility for desired hidden fields
	mailboxes.forEach( ( mailbox ) => {
		hiddenFieldNames.forEach( ( fieldName ) => {
			mailbox.setFieldIsVisible( fieldName, false );
			mailbox.setFieldIsRequired( fieldName, false );
		} );
	} );

	const addMailbox = () => {
		const newMailboxes = [ ...mailboxes, createNewMailbox() ];
		setMailboxes( newMailboxes );
		const eventName = isTitan
			? 'calypso_email_titan_add_mailboxes_add_another_mailbox_button_click'
			: 'calypso_email_google_workspace_add_mailboxes_add_another_mailbox_button_click';
		recordTracksEvent( eventName, { mailbox_count: newMailboxes.length } );
	};

	const removeMailbox = useCallback(
		( uuid: string ) => () => {
			const newMailboxes = mailboxes.filter(
				( mailbox ) => mailbox.formFields.uuid.value !== uuid
			);
			setMailboxes( newMailboxes );
			const eventName = isTitan
				? 'calypso_email_titan_add_mailboxes_remove_mailbox_button_click'
				: 'calypso_email_google_workspace_add_mailboxes_remove_mailbox_button_click';
			recordTracksEvent( eventName, { mailbox_count: newMailboxes.length } );
		},
		[ isTitan, mailboxes ]
	);

	const handleCancel = () => onCancel();

	const persistMailboxesToState = () => {
		setMailboxes( [ ...mailboxes ] );
	};

	const handleSubmit = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		mailboxes.forEach( ( mailbox ) => mailbox.validate( true ) );
		persistMailboxesToState();

		onSubmit( new MailboxOperations( mailboxes, persistMailboxesToState ) );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<fieldset className="new-mailbox-list__main" disabled={ areButtonsBusy }>
				{ mailboxes.map( ( mailbox, index ) => {
					const uuid = mailbox.formFields.uuid.value;

					const onFieldValueChanged = ( field: MailboxFormFieldBase< string > ) => {
						if ( ! [ FIELD_FIRSTNAME, FIELD_NAME ].includes( field.fieldName ) ) {
							return;
						}
						if ( mailbox.getIsFieldTouched( FIELD_MAILBOX ) ) {
							return;
						}

						mailbox.setFieldValue( FIELD_MAILBOX, sanitizeMailboxValue( field.value ) );
						mailbox.validateField( FIELD_MAILBOX );

						mailbox.formFields.mailbox.dispatchState();
					};

					return (
						<Fragment key={ 'form-' + uuid }>
							{ index > 0 && (
								<CardHeading
									className="new-mailbox-list__numbered-heading"
									tagName="h3"
									size={ 20 }
								>
									{ translate( 'Mailbox %(position)s', {
										args: { position: index + 1 },
										comment:
											'%(position)s is the position of the mailbox in a list, e.g. Mailbox 1, Mailbox 2, etc',
									} ) }
								</CardHeading>
							) }
							<MailboxFormWrapper mailbox={ mailbox } onFieldValueChanged={ onFieldValueChanged }>
								<>
									<div className="new-mailbox-list__actions">
										{ index > 0 && (
											<Button onClick={ removeMailbox( uuid ) } disabled={ areButtonsBusy }>
												<Gridicon icon="trash" />
												<span>{ translate( 'Remove this mailbox' ) }</span>
											</Button>
										) }
									</div>

									<hr className="new-mailbox-list__separator" />
								</>
							</MailboxFormWrapper>
						</Fragment>
					);
				} ) }

				<div
					className={ classNames( 'new-mailbox-list__supplied-actions', {
						'not-show-add-new-mailbox': ! showAddNewMailboxButton,
					} ) }
				>
					{ showAddNewMailboxButton && (
						<Button onClick={ addMailbox } disabled={ areButtonsBusy }>
							<Gridicon icon="plus" />
							<span>{ translate( 'Add another mailbox' ) }</span>
						</Button>
					) }

					<div className="new-mailbox-list__main-actions">
						{ showCancelButton && (
							<Button onClick={ handleCancel } disabled={ areButtonsBusy }>
								<span>{ translate( 'Cancel' ) }</span>
							</Button>
						) }
						<Button busy={ areButtonsBusy } primary type="submit">
							<span>{ submitActionText }</span>
						</Button>
					</div>
				</div>
			</fieldset>
		</form>
	);
};

export { NewMailBoxList };
export type { MailboxListProps };
