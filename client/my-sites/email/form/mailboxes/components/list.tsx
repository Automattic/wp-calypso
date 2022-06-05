import { Button, Gridicon } from '@automattic/components';
import { Fragment, useCallback } from '@wordpress/element';
import classNames from 'classnames';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxFormWrapper } from 'calypso/my-sites/email/form/mailboxes/components/form';
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

import './style.scss';

interface MailboxListProps {
	hiddenFieldNames?: MutableFormFieldNames[];
	onCancel?: () => void;
	onSubmit: ( mailboxes: MailboxForm< EmailProvider >[] ) => void;
	provider: EmailProvider;
	selectedDomainName: string;
	showAddNewMailboxButton?: boolean;
	showCancelButton?: boolean;
	submitActionText?: TranslateResult;
}

const NewMailBoxList = ( props: MailboxListProps & { children?: JSX.Element } ): JSX.Element => {
	const translate = useTranslate();

	const {
		hiddenFieldNames = [],
		onCancel = () => undefined,
		onSubmit,
		provider,
		selectedDomainName,
		showAddNewMailboxButton = false,
		showCancelButton = false,
		submitActionText = translate( 'Submit' ),
	} = props;

	const createNewMailbox = () => new MailboxForm< EmailProvider >( provider, selectedDomainName );

	const [ mailboxes, setMailboxes ] = useState( [ createNewMailbox() ] );

	// Set visibility for desired hidden fields
	mailboxes.forEach( ( mailbox ) => {
		hiddenFieldNames.forEach( ( fieldName ) => mailbox.setFieldIsVisible( fieldName, true ) );
	} );

	const addMailbox = () => {
		setMailboxes( [ ...mailboxes, createNewMailbox() ] );
	};

	const removeMailbox = useCallback(
		( uuid: string ) => () => {
			setMailboxes( mailboxes.filter( ( mailbox ) => mailbox.formFields.uuid.value !== uuid ) );
		},
		[ mailboxes ]
	);

	const handleCancel = () => onCancel();

	const persistMailboxes = () => {
		setMailboxes( [ ...mailboxes ] );
	};

	const handleSubmit = () => {
		mailboxes.forEach( ( mailbox ) => mailbox.validate( true ) );
		setMailboxes( [ ...mailboxes ] );
		onSubmit( mailboxes, persistMailboxes );
	};

	return (
		<div className="list__main">
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
							<CardHeading className="list__numbered-heading" tagName="h3" size={ 20 }>
								{ translate( 'Mailbox %(position)s', {
									args: { position: index + 1 },
									comment:
										'%(position)s is the position of the mailbox in a list, e.g. Mailbox 1, Mailbox 2, etc',
								} ) }
							</CardHeading>
						) }
						<MailboxFormWrapper mailbox={ mailbox } onFieldValueChanged={ onFieldValueChanged }>
							<>
								<div className="list__actions">
									{ index > 0 && (
										<Button onClick={ removeMailbox( uuid ) }>
											<Gridicon icon="trash" />
											<span>{ translate( 'Remove this mailbox' ) }</span>
										</Button>
									) }
								</div>

								<hr className="list__separator" />
							</>
						</MailboxFormWrapper>
					</Fragment>
				);
			} ) }

			<div
				className={ classNames( 'list__supplied-actions', {
					'not-show-add-new-mailbox': ! showAddNewMailboxButton,
				} ) }
			>
				{ showAddNewMailboxButton && (
					<Button onClick={ addMailbox }>
						<Gridicon icon="plus" />
						<span>{ translate( 'Add another mailbox' ) }</span>
					</Button>
				) }

				<div className="list__main-actions">
					{ showCancelButton && (
						<Button onClick={ handleCancel }>
							<span>{ translate( 'Cancel' ) }</span>
						</Button>
					) }
					<Button primary onClick={ handleSubmit }>
						<span>{ submitActionText }</span>
					</Button>
				</div>
			</div>
		</div>
	);
};

export { NewMailBoxList };
export type { MailboxListProps };
