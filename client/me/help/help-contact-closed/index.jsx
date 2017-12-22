/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n, { localize } from 'i18n-calypso';

const christmas2017ClosureStartsAt = i18n.moment( 'Sun, 24 Dec 2017 00:00:00 +0000' );
const newYear2018NoticeStartsAt = i18n.moment( 'Fri, 29 Dec 2017 00:00:00 +0000' );
const newYear2018ClosureStartsAt = i18n.moment( 'Sun, 31 Dec 2017 00:00:00 +0000' );

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';

const HelpContactClosed = ( { translate } ) => {
	const currentDate = i18n.moment();
	let closureHeading;
	let closureMessage;

	if ( currentDate >= newYear2018ClosureStartsAt ) {
		closureHeading = translate( "Limited Support New Year's Day" );
		closureMessage = translate(
			"Live chat is closed today for the New Year's Day holiday. If you need to get in touch with us, submit " +
				"a support request below and we'll respond by email. Live chat will reopen on January 2nd. Thank you!"
		);
	} else if ( currentDate >= newYear2018NoticeStartsAt ) {
		closureHeading = translate( "Limited Support New Year's Day" );
		closureMessage = translate(
			"Live chat will be closed on Monday, January 1, 2018 for the New Year's Day holiday. If you need " +
				"to get in touch with us, you’ll be able to submit a support request from this page and we'll " +
				'respond by email. Live chat will reopen on January 2nd. Thank you!'
		);
	} else if ( currentDate >= christmas2017ClosureStartsAt ) {
		closureHeading = translate( 'Limited Support over Christmas' );
		closureMessage = translate(
			'Live chat is closed today for the Christmas holiday. If you need to get in touch with us, submit ' +
				"a support request below and we'll respond by email. Live chat will reopen on December 26. Thank you!"
		);
	} else {
		closureHeading = translate( 'Limited Support over Christmas' );
		closureMessage = translate(
			'Live chat will be closed on Sunday, December 24th and Monday, December 25th for the Christmas holiday. ' +
				'If you need to get in touch with us, you’ll be able to submit a support request from this page and ' +
				"we'll respond by email. Live chat will reopen on December 26th. Thank you!"
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
