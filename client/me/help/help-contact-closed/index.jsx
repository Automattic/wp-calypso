/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n, { localize } from 'i18n-calypso';

const christmas2017ClosureStartsAt = i18n.moment( 'Sun, 24 Dec 2017 00:00:00 +0000' );

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';

const HelpContactClosed = ( { translate } ) => {
	return (
		<div className="help-contact-closed">
			<FormSectionHeading>{ translate( 'Limited Support over Christmas' ) }</FormSectionHeading>
			<div>
				<p>
					{ i18n.moment() < christmas2017ClosureStartsAt
						? translate(
								'Live chat will be closed on Sunday, December 24th and Monday, December 25th for the Christmas holiday. ' +
									'If you need to get in touch with us, you’ll be able to submit a support request from this page and ' +
									'we will get to it as fast as we can. Live chat will reopen on December 26th. Thank you!'
							)
						: translate(
								'Live chat is closed today for for the Christmas holiday. If you need to get in touch with us, ' +
									'you can submit a support request below and we will get to it as fast as we can. Live chat will ' +
									'reopen at 00:00 UTC on December 26. Thank you!'
							) }
				</p>
			</div>
			<hr />
		</div>
	);
};

export default localize( HelpContactClosed );
