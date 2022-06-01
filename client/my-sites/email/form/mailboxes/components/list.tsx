import { Button, Gridicon } from '@automattic/components';
import { useCallback } from '@wordpress/element';
import classNames from 'classnames';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import MailboxFormWrapper from 'calypso/my-sites/email/form/mailboxes/components/form';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

import './style.scss';

interface MailboxListProps {
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

	const handleSubmit = () => {
		mailboxes.forEach( ( mailbox ) => mailbox.validate( true ) );
		setMailboxes( [ ...mailboxes ] );
		onSubmit( mailboxes );
	};

	return (
		<div className="list__main">
			{ mailboxes.map( ( mailbox, index ) => (
				<>
					{ index > 0 && (
						<CardHeading className="list__numbered-heading" tagName="h3" size={ 20 }>
							{ translate( 'Mailbox %(position)s', {
								args: { position: index + 1 },
								comment:
									'%(position)s is the position of the mailbox in a list, e.g. Mailbox 1, Mailbox 2, etc',
							} ) }
						</CardHeading>
					) }
					<MailboxFormWrapper
						{ ...props }
						key={ mailbox.formFields.uuid.value }
						mailbox={ mailbox }
					>
						<>
							<div className="list__actions">
								{ index > 0 && (
									<Button onClick={ removeMailbox( mailbox.formFields.uuid.value ) }>
										<Gridicon icon="trash" />
										<span>{ translate( 'Remove this mailbox' ) }</span>
									</Button>
								) }
							</div>

							<hr className="list__separator" />
						</>
					</MailboxFormWrapper>
				</>
			) ) }

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
