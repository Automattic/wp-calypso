/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';

// In the translated dates 7am UTC is 12am/midnight PT
const closedStartDate = i18n.moment( 'Thu, 23 Nov 2017 00:00:00 +0000' );
const closedEndDate = i18n.moment( 'Fri, 24 Nov 2017 00:00:00 +0000' );

const HelpContactClosed = ( { translate } ) => {
	return (
		<div className="help-contact-closed">
			<FormSectionHeading>{ translate( 'Limited Support on Thanksgiving' ) }</FormSectionHeading>
			<div>
				<p>
					{ translate(
						'Live chat support will be closed for the Thanksgiving holiday on %(closed_start_date)s. ' +
							'Email support will be open during that time, and we will reopen live chat on %(closed_end_date)s.',
						{
							args: {
								closed_start_date: closedStartDate.format( 'dddd, MMMM D' ),
								closed_end_date: closedEndDate.format( 'dddd, MMMM D' ),
							},
						}
					) }
				</p>
			</div>
			<hr />
		</div>
	);
};

export default localize( HelpContactClosed );
