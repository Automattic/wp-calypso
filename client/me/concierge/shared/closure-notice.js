/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n, { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';

const ClosureNotice = ( {
	closureStartDate,
	closureEndDate,
	displayDate,
	holidayName,
	translate,
} ) => {
	const currentDate = i18n.moment();

	if (
		! currentDate.isBetween(
			i18n.moment.utc( displayDate ),
			i18n.moment.utc( closureEndDate ).endOf( 'day' )
		)
	) {
		return null;
	}

	let message;

	if ( currentDate.isBefore( i18n.moment.utc( closureStartDate ) ) ) {
		message = translate(
			'{{strong}}Note:{{/strong}} Concierge will be closed %(closureStartDate)s through ' +
				'%(closureEndDate)s for the %(holidayName)s holiday. If you need to get in touch ' +
				'with us, you’ll be able to {{link}}submit a support request{{/link}} and we’ll ' +
				'get to it as fast as we can.',
			{
				args: {
					closureStartDate: i18n.moment( closureStartDate ).format( 'dddd, MMMM Do' ),
					closureEndDate: i18n.moment( closureEndDate ).format( 'dddd, MMMM Do' ),
					holidayName,
				},
				components: {
					link: <a href="/help/contact" />,
					strong: <strong />,
				},
			}
		);
	} else {
		message = translate(
			'{{strong}}Note:{{/strong}} Concierge is closed today for the %(holidayName)s holiday. ' +
				'If you need to get in touch with us, you’ll be able to {{link}}submit a support ' +
				'request{{/link}} and we’ll get back to you as fast as we can. Concierge will ' +
				'reopen on %(reopenDate)s. Thank you!',
			{
				args: {
					reopenDate: i18n
						.moment( closureEndDate )
						.add( 1, 'day' )
						.format( 'MMMM Do' ),
					holidayName,
				},
				components: {
					link: <a href="/help/contact" />,
					strong: <strong />,
				},
			}
		);
	}
	return <Card>{ message }</Card>;
};

export default localize( ClosureNotice );
