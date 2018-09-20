/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import FormSectionHeading from 'components/forms/form-section-heading';

const easter2018ClosureStartsAt = i18n.moment( 'Sun, 1 Apr 2018 00:00:00 +0000' );

const HelpContactClosed = ( { compact, translate } ) => {
	const currentDate = i18n.moment();
	let closureHeading;
	let closureMessage;

	if ( currentDate <= easter2018ClosureStartsAt ) {
		closureHeading = translate( 'Limited Support over Easter' );
		closureMessage = translate(
			'Live chat will be closed on Sunday, April 1, 2018 for the Easter Sunday holiday. ' +
				'If you need to get in touch with us, you’ll be able to submit a support request ' +
				"from this page and we'll respond by email. Live chat will reopen on April 2nd. Thank you!"
		);
	} else {
		closureHeading = translate( 'Limited Support over Easter' );
		closureMessage = translate(
			'Live chat is closed today for the Easter Sunday holiday. If you need to get in touch with us, submit a support ' +
				"request below and we'll respond by email. Live chat will reopen on April 2nd. Thank you!"
		);
	}

	if ( compact ) {
		return (
			<FoldableCard
				className="help-contact-closed"
				clickableHeader={ true }
				compact={ true }
				header={ closureHeading }
			>
				{ closureMessage }
			</FoldableCard>
		);
	}

	return (
		<div className="help-contact-closed">
			<FormSectionHeading>{ closureHeading }</FormSectionHeading>
			<div>
				<p>{ closureMessage }</p>
			</div>
			<hr />
		</div>
	);
};

export default localize( HelpContactClosed );
