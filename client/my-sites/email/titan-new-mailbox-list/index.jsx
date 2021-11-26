import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import CardHeading from 'calypso/components/card-heading';
import {
	buildNewTitanMailbox,
	getMailboxPropTypeShape,
	sanitizeEmailSuggestion,
	validateMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import TitanNewMailbox, {
	FULL_NAME_TITAN_FIELD,
	PASSWORD_RESET_TITAN_FIELD,
} from 'calypso/my-sites/email/titan-new-mailbox';

import './style.scss';

const noop = () => {};

const TitanNewMailboxList = ( {
	children,
	hiddenFields,
	selectedDomainName,
	mailboxes,
	onMailboxesChange,
	onReturnKeyPress = noop,
	showAddAnotherMailboxButton = true,
	validatedMailboxUuids = [],
} ) => {
	const translate = useTranslate();

	const onMailboxValueChange = ( uuid ) => ( fieldName, fieldValue, mailboxFieldTouched ) => {
		const updatedMailboxes = mailboxes.map( ( mailbox ) => {
			if ( mailbox.uuid !== uuid ) {
				return mailbox;
			}

			const updatedMailbox = { ...mailbox, [ fieldName ]: { value: fieldValue, error: null } };

			if ( 'name' === fieldName && ! mailboxFieldTouched ) {
				return {
					...updatedMailbox,
					mailbox: { value: sanitizeEmailSuggestion( fieldValue ), error: null },
				};
			}

			return updatedMailbox;
		} );

		onMailboxesChange( validateMailboxes( updatedMailboxes ) );
	};

	const onMailboxAdd = () => {
		onMailboxesChange( [ ...mailboxes, buildNewTitanMailbox( selectedDomainName, false ) ] );
	};

	const onMailboxRemove = ( currentMailboxes, uuid ) => () => {
		const remainingMailboxes = currentMailboxes.filter( ( mailbox ) => mailbox.uuid !== uuid );

		const updatedMailboxes =
			0 < remainingMailboxes.length
				? remainingMailboxes
				: [ buildNewTitanMailbox( selectedDomainName, false ) ];
		onMailboxesChange( updatedMailboxes );
	};

	return (
		<div className="titan-new-mailbox-list__main">
			{ mailboxes.map( ( mailbox, index ) => (
				<Fragment key={ `${ index }:${ mailbox.uuid }` }>
					{ index > 0 && (
						<CardHeading
							className="titan-new-mailbox-list__numbered-heading"
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

					<TitanNewMailbox
						selectedDomainName={ selectedDomainName }
						onMailboxValueChange={ onMailboxValueChange( mailbox.uuid ) }
						mailbox={ mailbox }
						onReturnKeyPress={ onReturnKeyPress }
						showAllErrors={ validatedMailboxUuids.includes( mailbox.uuid ) }
						hiddenFields={ hiddenFields }
					/>

					<div className="titan-new-mailbox-list__actions">
						{ index > 0 && (
							<Button
								className="titan-new-mailbox-list__action-remove"
								onClick={ onMailboxRemove( mailboxes, mailbox.uuid ) }
							>
								<Gridicon icon="trash" />
								<span>{ translate( 'Remove this mailbox' ) }</span>
							</Button>
						) }
					</div>

					<hr className="titan-new-mailbox-list__separator" />
				</Fragment>
			) ) }

			<div className="titan-new-mailbox-list__supplied-actions">
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

TitanNewMailboxList.propTypes = {
	children: PropTypes.node,
	selectedDomainName: PropTypes.string.isRequired,
	mailboxes: PropTypes.arrayOf( getMailboxPropTypeShape() ).isRequired,
	onMailboxesChange: PropTypes.func.isRequired,
	onReturnKeyPress: PropTypes.func,
	showAddAnotherMailboxButton: PropTypes.bool,
	hiddenFields: PropTypes.arrayOf(
		PropTypes.oneOf( [ FULL_NAME_TITAN_FIELD, PASSWORD_RESET_TITAN_FIELD ] )
	),
};

export default TitanNewMailboxList;
