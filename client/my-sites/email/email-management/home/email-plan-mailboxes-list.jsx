/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { Button, CompactCard } from '@automattic/components';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
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
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { resendVerificationEmail } from 'calypso/state/email-forwarding/actions';

const MailboxListHeader = ( { children } ) => {
	const translate = useTranslate();

	return (
		<div className="email-plan-mailboxes-list__mailbox-list">
			<SectionHeader label={ translate( 'Mailboxes' ) } />
			{ children }
		</div>
	);
};

const MailboxListItem = ( { children, isError = false, isPlaceholder, hasNoEmails } ) => {
	const className = classNames( 'email-plan-mailboxes-list__mailbox-list-item', {
		'is-placeholder': isPlaceholder,
		'no-emails': hasNoEmails,
	} );
	return (
		<CompactCard className={ className } highlight={ isError ? 'error' : null }>
			{ children }
		</CompactCard>
	);
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

const resendEmailForwardVerification = ( mailbox, dispatch ) => {
	const destination = getEmailForwardAddress( mailbox );
	dispatch(
		recordTracksEvent(
			'calypso_email_management_email_forwarding_resend_verification_email_click',
			{
				destination,
				domain_name: mailbox.domain,
				mailbox: mailbox.mailbox,
			}
		)
	);
	dispatch( resendVerificationEmail( mailbox.domain, mailbox.mailbox, destination ) );
};

const getActionsForMailbox = ( mailbox, translate, dispatch ) => {
	if ( isEmailForward( mailbox ) && ! isEmailForwardVerified( mailbox ) ) {
		return {
			action: (
				<Button compact onClick={ () => resendEmailForwardVerification( mailbox, dispatch ) }>
					{ translate( 'Resend verification email' ) }
				</Button>
			),
			warning: <MailboxListItemWarning warningText={ translate( 'Verification required' ) } />,
		};
	}

	return {
		action: null,
		warning: null,
	};
};

function EmailPlanMailboxesList( { mailboxes, isLoadingEmails } ) {
	const dispatch = useDispatch();
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

	if ( ! mailboxes || mailboxes.length < 1 ) {
		return (
			<MailboxListHeader>
				<MailboxListItem hasNoEmails>
					<span>{ translate( 'No mailboxes' ) }</span>
				</MailboxListItem>
			</MailboxListHeader>
		);
	}

	const mailboxItems = mailboxes.map( ( mailbox ) => {
		const { action, warning } = getActionsForMailbox( mailbox, translate, dispatch );

		return (
			<MailboxListItem key={ mailbox.mailbox } isError={ !! warning }>
				<div className="email-plan-mailboxes-list__mailbox-list-item-main">
					<div>
						<MaterialIcon icon="email" />
						<span>
							{ mailbox.mailbox }@{ mailbox.domain }
						</span>
					</div>
					{ isEmailForward( mailbox ) && (
						<MailboxListItemSecondaryDetails className="email-plan-mailboxes-list__mailbox-list-forward">
							<Gridicon icon="chevron-right" />
							<span> { getEmailForwardAddress( mailbox ) } </span>
						</MailboxListItemSecondaryDetails>
					) }
				</div>
				{ isEmailUserAdmin( mailbox ) && (
					<Badge type="info">
						{ translate( 'Admin', {
							comment: 'Email user role displayed as a badge',
						} ) }
					</Badge>
				) }
				{ warning }
				{ action }
			</MailboxListItem>
		);
	} );

	return <MailboxListHeader>{ mailboxItems }</MailboxListHeader>;
}

EmailPlanMailboxesList.propTypes = {
	mailboxes: PropTypes.array,
	isLoadingEmails: PropTypes.bool,
};

export default EmailPlanMailboxesList;
