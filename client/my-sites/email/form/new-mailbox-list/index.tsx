import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import CardHeading from 'calypso/components/card-heading';
import { FIELD_FIRSTNAME, FIELD_UUID } from 'calypso/my-sites/email/new-mailbox-list/constants';
import NewMailbox from 'calypso/my-sites/email/new-mailbox-list/new-mailbox';
import {
	getNewMailbox,
	sanitizeValueForEmail,
	validateMailboxes,
} from 'calypso/my-sites/email/new-mailbox-list/utilities';
import type {
	Mailbox,
	Provider,
	StringOrBoolean,
} from 'calypso/my-sites/email/new-mailbox-list/types';
import type { SiteDomain } from 'calypso/state/sites/domains/types';
import type { ReactElement, ReactNode } from 'react';

interface NewMailboxListProps {
	children?: ReactNode;
	domains?: SiteDomain[];
	extraValidation?: ( mailbox: Mailbox ) => Mailbox;
	hiddenFieldNames: string[];
	mailboxes: Mailbox[];
	onMailboxesChange: ( mailboxes: Mailbox[] ) => void;
	onReturnKeyPress: ( event: Event ) => void;
	provider: Provider;
	selectedDomainName: string;
	showAddAnotherMailboxButton?: boolean;
	validatedMailboxUuids?: string[];
}

const NewMailboxList = ( {
	children,
	domains,
	extraValidation = ( mailbox: Mailbox ) => mailbox,
	hiddenFieldNames = [],
	mailboxes = [],
	onMailboxesChange,
	onReturnKeyPress,
	provider,
	selectedDomainName,
	showAddAnotherMailboxButton = false,
	validatedMailboxUuids = [],
}: NewMailboxListProps ): ReactElement => {
	const translate = useTranslate();

	const onMailboxValueChange =
		( uuid: string ) =>
		( fieldName: string, fieldValue: StringOrBoolean, mailBoxFieldTouched = false ) => {
			const updatedMailboxes = mailboxes.map( ( mailbox ) => {
				if ( mailbox[ FIELD_UUID ] !== uuid ) {
					return mailbox;
				}

				const updatedMailbox = { ...mailbox, [ fieldName ]: { value: fieldValue, error: null } };

				if ( FIELD_FIRSTNAME === fieldName && ! mailBoxFieldTouched ) {
					return {
						...updatedMailbox,
						mailBox: { value: sanitizeValueForEmail( fieldValue as string ), error: null },
					};
				}

				return updatedMailbox;
			} );

			onMailboxesChange( validateMailboxes( updatedMailboxes, extraValidation, hiddenFieldNames ) );
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

	return (
		<div className="new-mailbox-list__main">
			{ mailboxes.map( ( mailbox, index ) => (
				<Fragment key={ `${ index }:${ mailbox.uuid }` }>
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
							domains ? domains.map( ( domain ) => domain.name ?? '' ) : [ selectedDomainName ]
						}
						hiddenFieldNames={ hiddenFieldNames }
						onMailboxValueChange={ onMailboxValueChange( mailbox.uuid ) }
						mailbox={ mailbox }
						onReturnKeyPress={ onReturnKeyPress }
						provider={ provider }
						selectedDomainName={ selectedDomainName }
						showAllErrors={ validatedMailboxUuids.includes( mailbox.uuid ) }
					/>

					<div className="new-mailbox-list__actions">
						{ index > 0 && (
							<Button
								className="new-mailbox-list__action-remove"
								onClick={ onMailboxRemove( mailboxes, mailbox.uuid ) }
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
