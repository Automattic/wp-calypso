/**
 * External dependencies
 */
import React from 'react';
import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MaterialIcon from 'calypso/components/material-icon';
import SectionHeader from 'calypso/components/section-header';
import Badge from 'calypso/components/badge';
import { isEmailUserAdmin } from 'calypso/lib/emails';

function EmailPlanMailboxesList( { emails } ) {
	const translate = useTranslate();
	if ( ! emails || emails.length < 1 ) {
		return null;
	}

	const emailsItems = emails.map( ( email ) => {
		return (
			<CompactCard
				key={ `email-row-${ email.mailbox }` }
				className="email-plan-mailboxes-list__mailbox-list-item"
			>
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
			</CompactCard>
		);
	} );

	return (
		<div className="email-plan-mailboxes-list__mailbox-list">
			<SectionHeader label={ translate( 'Mailboxes' ) } />
			{ emailsItems }
		</div>
	);
}

export default EmailPlanMailboxesList;
