/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import MaterialIcon from 'calypso/components/material-icon';
import SectionHeader from 'calypso/components/section-header';
import Badge from 'calypso/components/badge';

class EmailPlanMailboxesList extends React.Component {
	render() {
		const { emails, translate } = this.props;

		if ( ! emails || emails.length < 1 ) {
			return null;
		}

		const emailsItems = emails.map( ( email ) => {
			return (
				<CompactCard
					key={ `email-row-${ email.email }` }
					className="email-plan-mailboxes-list__mailbox-list-item"
				>
					<MaterialIcon icon="email" />
					<span>{ email.email }</span>
					{ email.isAdmin && (
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
}

export default localize( EmailPlanMailboxesList );
