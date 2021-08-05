/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	buildNewTitanMailbox,
	getMailboxPropTypeShape,
	sanitizeEmailSuggestion,
	validateMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import { Button } from '@automattic/components';
import CardHeading from 'calypso/components/card-heading';
import Gridicon from 'calypso/components/gridicon';
import TitanNewMailbox from 'calypso/my-sites/email/titan-new-mailbox';

/**
 * Style dependencies
 */
import './style.scss';

const noop = () => {};

const TitanNewMailboxList = ( {
	children,
	domain,
	mailboxes,
	onMailboxesChange,
	onReturnKeyPress = noop,
	showAddAnotherMailboxButton = true,
	showLabels = true,
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

	const onMailboxAdd = ( afterIndex ) => {
		onMailboxesChange( [
			...mailboxes.slice( 0, afterIndex + 1 ),
			buildNewTitanMailbox( domain, false ),
			...mailboxes.slice( afterIndex + 1 ),
		] );
	};

	const onMailboxRemove = ( currentMailboxes, uuid ) => () => {
		const remainingMailboxes = currentMailboxes.filter( ( mailbox ) => mailbox.uuid !== uuid );

		const updatedMailboxes =
			0 < remainingMailboxes.length
				? remainingMailboxes
				: [ buildNewTitanMailbox( domain, false ) ];
		onMailboxesChange( updatedMailboxes );
	};

	return (
		<div className="titan-new-mailbox-list__main">
			{ mailboxes.map( ( mailbox, index ) => (
				<React.Fragment key={ `${ mailbox.uuid }:${ index }` }>
					{ index > 0 && (
						<CardHeading tagName="h3" size={ 20 }>
							Mailbox { String( index + 1 ).padStart( 2, '0' ) }
						</CardHeading>
					) }
					<TitanNewMailbox
						onMailboxValueChange={ onMailboxValueChange( mailbox.uuid ) }
						mailbox={ mailbox }
						onReturnKeyPress={ onReturnKeyPress }
						showAllErrors={ validatedMailboxUuids.includes( mailbox.uuid ) }
						showLabels={ showLabels }
					/>

					<div className="titan-new-mailbox-list__actions">
						{ showAddAnotherMailboxButton && (
							<Button
								className="titan-new-mailbox-list__add-mailbox-button"
								onClick={ () => onMailboxAdd( index ) }
							>
								<Gridicon icon="plus" />
								<span>{ translate( 'Add another mailbox' ) }</span>
							</Button>
						) }
						{ index > 0 && (
							<Button
								className="titan-new-mailbox-list__add-mailbox-button"
								onClick={ onMailboxRemove( mailboxes, mailbox.uuid ) }
							>
								<Gridicon icon="trash" />
								<span>{ translate( 'Remove this mailbox' ) }</span>
							</Button>
						) }
					</div>

					<hr className="titan-new-mailbox-list__new-mailbox-separator" />
				</React.Fragment>
			) ) }

			{ children }
		</div>
	);
};

TitanNewMailboxList.propTypes = {
	children: PropTypes.node,
	domain: PropTypes.string.isRequired,
	mailboxes: PropTypes.arrayOf( getMailboxPropTypeShape() ).isRequired,
	onMailboxesChange: PropTypes.func.isRequired,
	onReturnKeyPress: PropTypes.func,
	showAddAnotherMailboxButton: PropTypes.bool,
	showLabels: PropTypes.bool,
};

export default TitanNewMailboxList;
