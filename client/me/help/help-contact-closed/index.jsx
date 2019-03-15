/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n, { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import FormSectionHeading from 'components/forms/form-section-heading';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getUserPurchases } from 'state/purchases/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const thanksgiving2018ClosureStartsAt = i18n.moment( 'Thu, 22 Nov 2018 00:00:00 +0000' );

const BusinessPlanMessage = ( { translate } ) => {
	const message = [];

	if ( i18n.moment() < thanksgiving2018ClosureStartsAt ) {
		message.push(
			translate(
				"{{p}}Live chat will be closed on Thursday, November 22, 2018 for the US Thanksgiving holiday. If you need to get in touch with us, you’ll be able to submit a support request from this page and we'll respond by email. Live chat will reopen on November 23rd. Thank you!!{{/p}}",
				{
					components: {
						p: <p />,
					},
				}
			)
		);
	} else {
		message.push(
			translate(
				"{{p}}Live chat is closed today for the US Thanksgiving holiday. If you need to get in touch with us, submit a support request below and we'll respond by email. Live chat will reopen on November 23rd. Thank you!{{/p}}",
				{
					components: {
						p: <p />,
					},
				}
			)
		);
	}

	return message;
};

const HelpContactClosed = ( { compact, translate } ) => {
	const closureHeading = translate( 'Limited Support November 22' );
	const closureMessage = <BusinessPlanMessage compact={ compact } translate={ translate } />;

	if ( compact ) {
		return (
			<FoldableCard
				className="help-contact-closed"
				clickableHeader={ true }
				compact={ true }
				header={ closureHeading }
			>
				{ closureMessage }
				{ translate( '{{contactLink}}Read more.{{/contactLink}}', {
					components: { contactLink: <a href="/help/contact" /> },
				} ) }
			</FoldableCard>
		);
	}

	return (
		<div className="help-contact-closed">
			<FormSectionHeading>{ closureHeading }</FormSectionHeading>
			<div>{ closureMessage }</div>
			<hr />
		</div>
	);
};

export default connect( state => {
	const userId = getCurrentUserId( state );
	return { purchases: getUserPurchases( state, userId ) };
} )( localize( HelpContactClosed ) );
