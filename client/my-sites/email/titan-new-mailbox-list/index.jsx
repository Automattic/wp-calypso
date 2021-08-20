import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';
import {
	buildNewTitanMailbox,
	getMailboxPropTypeShape,
	sanitizeEmailSuggestion,
	validateMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import TitanNewMailbox from 'calypso/my-sites/email/titan-new-mailbox';

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

	const onMailboxAdd = () => {
		onMailboxesChange( [ ...mailboxes, buildNewTitanMailbox( domain, false ) ] );
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
				<TitanNewMailbox
					key={ mailbox.uuid }
					onMailboxAdd={ onMailboxAdd }
					onMailboxRemove={ onMailboxRemove( mailboxes, mailbox.uuid ) }
					onMailboxValueChange={ onMailboxValueChange( mailbox.uuid ) }
					mailbox={ mailbox }
					onReturnKeyPress={ onReturnKeyPress }
					showAllErrors={ validatedMailboxUuids.includes( mailbox.uuid ) }
					showLabels={ showLabels }
					showTrashButton={ index > 0 }
				/>
			) ) }

			<div className="titan-new-mailbox-list__actions">
				{ showAddAnotherMailboxButton && (
					<Button onClick={ onMailboxAdd }>
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
	domain: PropTypes.string.isRequired,
	mailboxes: PropTypes.arrayOf( getMailboxPropTypeShape() ).isRequired,
	onMailboxesChange: PropTypes.func.isRequired,
	onReturnKeyPress: PropTypes.func,
	showAddAnotherMailboxButton: PropTypes.bool,
	showLabels: PropTypes.bool,
};

export default TitanNewMailboxList;
