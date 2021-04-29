/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { CompactCard } from '@automattic/components';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MaterialIcon from 'calypso/components/material-icon';
import SectionHeader from 'calypso/components/section-header';
import Badge from 'calypso/components/badge';
import {
	getEmailForwardAddress,
	isEmailForward,
	isEmailForwardVerified,
	isEmailUserAdmin,
} from 'calypso/lib/emails';
import Gridicon from 'calypso/components/gridicon';

const MailboxListHeader = ( { children } ) => {
	const translate = useTranslate();

	return (
		<div className="email-plan-mailboxes-list__mailbox-list">
			<SectionHeader label={ translate( 'Mailboxes' ) } />
			{ children }
		</div>
	);
};

const MailboxListItem = ( { children, isPlaceholder, hasNoEmails } ) => {
	const className = classNames( 'email-plan-mailboxes-list__mailbox-list-item', {
		'is-placeholder': isPlaceholder,
		'no-emails': hasNoEmails,
	} );
	return <CompactCard className={ className }>{ children }</CompactCard>;
};

const MailboxListItemSecondaryDetails = ( { children, className } ) => {
	const fullClassName = classNames( 'email-plan-mailboxes-list__mailbox-secondary', className );
	return <div className={ fullClassName }>{ children }</div>;
};

const MailboxListItemWarning = ( { warningText } ) => {
	return (
		<div className="email-plan-mailboxes-list__mailbox-list-item-warning">
			<Gridicon icon="info-outline" size={ 18 } />
			<span>{ warningText }</span>
		</div>
	);
};

const getWarningForMailbox = ( mailbox, translate ) => {
	if ( isEmailForward( mailbox ) && ! isEmailForwardVerified( mailbox ) ) {
		return <MailboxListItemWarning warningText={ translate( 'Verification required' ) } />;
	}

	return null;
};

function EmailPlanMailboxesList( { emails, isLoadingEmails } ) {
	const translate = useTranslate();

	if ( isLoadingEmails ) {
		return (
			<MailboxListHeader>
				<MailboxListItem isPlaceholder>
					<MaterialIcon icon="email" />
					<span />
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	if ( ! emails || emails.length < 1 ) {
		return (
			<MailboxListHeader>
				<MailboxListItem hasNoEmails>
					<span>{ translate( 'No mailboxes' ) }</span>
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	const emailsItems = emails.map( ( email ) => {
		return (
			<MailboxListItem key={ email.mailbox }>
				<MaterialIcon icon="email" />
				<span>
					{ email.mailbox }@{ email.domain }
				</span>
				{ isEmailUserAdmin( email ) && (
					<Badge type="info">
						{ translate( 'Admin', {
							comment: 'Email user role displayed as a badge',
						} ) }
					</Badge>
				) }
				{ getWarningForMailbox( email, translate ) }
				{ isEmailForward( email ) && (
					<MailboxListItemSecondaryDetails className="email-plan-mailboxes-list__mailbox-list-forward">
						<Gridicon icon="chevron-right" />
						<span> { getEmailForwardAddress( email ) } </span>
					</MailboxListItemSecondaryDetails>
				) }
			</MailboxListItem>
		);
	} );

	return <MailboxListHeader>{ emailsItems }</MailboxListHeader>;
}

EmailPlanMailboxesList.propTypes = {
	emails: PropTypes.array,
	isLoadingEmails: PropTypes.bool,
};

export default EmailPlanMailboxesList;
