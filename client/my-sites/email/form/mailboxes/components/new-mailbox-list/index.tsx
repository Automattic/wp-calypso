import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxFormWrapper } from 'calypso/my-sites/email/form/mailboxes/components/mailbox-form-wrapper';
import useGetExistingMailboxNames from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list/use-get-existing-mailbox-names';
import { MailboxOperations } from 'calypso/my-sites/email/form/mailboxes/components/utilities/mailbox-operations';
import { sanitizeMailboxValue } from 'calypso/my-sites/email/form/mailboxes/components/utilities/sanitize-mailbox-value';
import {
	FIELD_FIRSTNAME,
	FIELD_IS_ADMIN,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_PASSWORD_RESET_EMAIL,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import {
	EmailProvider,
	FormFieldNames,
	MailboxFormFieldBase,
	MutableFormFieldNames,
} from 'calypso/my-sites/email/form/mailboxes/types';
import type { ReactNode } from 'react';

import './style.scss';

type HiddenFieldNames = Exclude<
	MutableFormFieldNames,
	typeof FIELD_MAILBOX | typeof FIELD_PASSWORD
>;

const possibleHiddenFieldNames: HiddenFieldNames[] = [
	FIELD_NAME,
	FIELD_FIRSTNAME,
	FIELD_LASTNAME,
	FIELD_IS_ADMIN,
	FIELD_PASSWORD_RESET_EMAIL,
];

const setFieldsVisibilities = (
	mailboxes: MailboxForm< EmailProvider >[],
	hiddenFieldNames: HiddenFieldNames[]
) => {
	mailboxes.forEach( ( mailbox ) => {
		// First do a reset
		possibleHiddenFieldNames
			.filter( ( fieldName ) => ! hiddenFieldNames.includes( fieldName ) )
			.forEach( ( fieldName ) => {
				mailbox.setFieldIsVisible( fieldName, true );
				mailbox.setFieldIsRequired( fieldName, fieldName !== FIELD_IS_ADMIN );
			} );
		possibleHiddenFieldNames
			.filter( ( fieldName ) => hiddenFieldNames.includes( fieldName ) )
			.forEach( ( fieldName ) => {
				mailbox.setFieldIsVisible( fieldName, false );
				mailbox.setFieldIsRequired( fieldName, false );
			} );
	} );
};

interface MailboxListProps {
	areButtonsBusy?: boolean;
	cancelActionText?: TranslateResult;
	fieldLabelTexts?: Partial< Record< MutableFormFieldNames, TranslateResult > >;
	isAutoFocusEnabled?: boolean;
	hiddenFieldNames?: HiddenFieldNames[];
	initialFieldValues?: Partial< Record< HiddenFieldNames, string | boolean > >;
	isInitialMailboxPurchase?: boolean;
	onCancel?: () => void;
	onSubmit: ( mailboxOperations: MailboxOperations ) => void;
	provider: EmailProvider;
	selectedDomainName: string;
	showAddNewMailboxButton?: boolean;
	showCancelButton?: boolean;
	submitActionText?: TranslateResult;
}

const NewMailBoxList = (
	props: MailboxListProps & { children?: ReactNode }
): JSX.Element | null => {
	const translate = useTranslate();

	const {
		areButtonsBusy = false,
		cancelActionText = translate( 'Cancel' ),
		fieldLabelTexts = {},
		isAutoFocusEnabled = false,
		children,
		hiddenFieldNames = [],
		initialFieldValues = {},
		isInitialMailboxPurchase = false,
		onCancel = () => undefined,
		onSubmit,
		provider,
		selectedDomainName,
		showAddNewMailboxButton = false,
		showCancelButton = false,
		submitActionText = translate( 'Submit' ),
	} = props;

	const existingMailboxes = useGetExistingMailboxNames(
		provider,
		selectedDomainName,
		isInitialMailboxPurchase
	);

	const createNewMailbox = () => {
		const mailbox = new MailboxForm< EmailProvider >(
			provider,
			selectedDomainName,
			existingMailboxes
		);
		// Set initial values
		Object.entries( initialFieldValues ).forEach( ( [ fieldName, value ] ) => {
			mailbox.setFieldValue( fieldName as FormFieldNames, value );
		} );
		setFieldsVisibilities( [ mailbox ], hiddenFieldNames );
		return mailbox;
	};

	const [ mailboxes, setMailboxes ] = useState( [ createNewMailbox() ] );
	const isTitan = provider === EmailProvider.Titan;

	const persistMailboxesToState = useCallback( () => {
		setMailboxes( [ ...mailboxes ] );
	}, [ mailboxes ] );

	useEffect( () => {
		setMailboxes( ( mailboxes ) => {
			setFieldsVisibilities( mailboxes, hiddenFieldNames );
			return [ ...mailboxes ];
		} );
	}, [ hiddenFieldNames.join( '' ) ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const addMailbox = () => {
		const newMailboxes = [ ...mailboxes, createNewMailbox() ];
		const eventName = isTitan
			? 'calypso_email_titan_add_mailboxes_add_another_mailbox_button_click'
			: 'calypso_email_google_workspace_add_mailboxes_add_another_mailbox_button_click';

		setMailboxes( newMailboxes );
		recordTracksEvent( eventName, { mailbox_count: newMailboxes.length } );
	};

	const removeMailbox = useCallback(
		( uuid: string ) => () => {
			const newMailboxes = mailboxes.filter(
				( mailbox ) => mailbox.formFields.uuid.value !== uuid
			);
			const eventName = isTitan
				? 'calypso_email_titan_add_mailboxes_remove_mailbox_button_click'
				: 'calypso_email_google_workspace_add_mailboxes_remove_mailbox_button_click';

			setMailboxes( newMailboxes );
			recordTracksEvent( eventName, { mailbox_count: newMailboxes.length } );
		},
		[ isTitan, mailboxes ]
	);

	const handleCancel = () => onCancel();

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
						<div key={ 'form-' + uuid }>
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
							<MailboxFormWrapper
								fieldLabelTexts={ fieldLabelTexts }
								mailbox={ mailbox }
								onFieldValueChanged={ onFieldValueChanged }
								index={ index }
								isAutoFocusEnabled={ isAutoFocusEnabled }
							>
								<>
									<div className="new-mailbox-list__children">{ children }</div>
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
						</div>
					);
				} ) }

				<div
					className={ clsx( 'new-mailbox-list__supplied-actions', {
						'new-mailbox-list__supplied-actions--disable-additional-mailboxes':
							! showAddNewMailboxButton,
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
								<span>{ cancelActionText }</span>
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
export type { HiddenFieldNames, MailboxListProps };
