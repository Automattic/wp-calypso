/**
 * Fixed notice about upcoming support closures
 */

/**
 * External dependencies
 */
import React from 'react';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';

const closedFrom = i18n.moment( 'Thu, 24 Nov 2016 08:00:00 +0000' );
const closedTo = i18n.moment( 'Fri, 25 Nov 2016 08:00:00 +0000' );

export default localize( ( props ) => {
	const {	translate } = props;

	return (
		<div className="help-contact-closure-notice">
			<FormSectionHeading>{ translate( 'Limited Support For Thanksgiving' ) }</FormSectionHeading>
			<p>
				{ translate(
					'Live chat support will be closed from %(closed_start_date)s through %(closed_end_date)s ' +
					'for the US Thanksgiving holiday. If you need to get in touch with us that day, you’ll be able to submit a support ' +
					'request from this page and we will get to it as fast as we can. Thank you!', {
						args: {
							closed_start_date: closedFrom.format( 'dddd, MMMM Do, YYYY HH:mm' ),
							closed_end_date: closedTo.format( 'dddd, MMMM Do, YYYY HH:mm' ),
						}
					}
				) }
			</p>
		</div>
	);
} );
