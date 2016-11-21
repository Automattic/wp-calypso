/**
 * External dependencies
 */
import * as React from 'react';

export const title = ( { translate, reason } ) => {
	switch ( reason ) {
		case 'thanksgiving':
			return translate( 'Limited Support For Thanksgiving' );
	}

	return null;
};

export const upcoming = ( { translate, reason, closedFrom, closedTo } ) => {
	switch ( reason ) {
		case 'thanksgiving':
			return translate(
				'Live chat support will be closed from ' +
				'{{strong}}%(closed_start_date)s{{/strong}} through {{strong}}%(closed_end_date)s{{/strong}} ' +
				'for the US Thanksgiving holiday. If you need to get in touch with us that day, you’ll be able ' +
				'to submit a support request from this page and we will get to it as fast as we can. Thank you!', {
					args: {
						closed_start_date: closedFrom.format( 'llll' ),
						closed_end_date: closedTo.format( 'llll' ),
					},
					components: {
						strong: <strong />
					}
				}
			);
	}

	return null;
};

export const closed = ( { translate, reason, closedTo } ) => {
	switch ( reason ) {
		case 'thanksgiving':
			return translate(
				'Live chat is closed today for the US Thanksgiving holiday. To get in touch, please ' +
				'submit a support request below and we will get to it as fast as we can. Live chat ' +
				'will reopen on {{strong}}%(closed_end_date)s{{/strong}}. Thank you!', {
					args: {
						closed_end_date: closedTo.format( 'llll' ),
					},
					components: {
						strong: <strong />
					}
				}
			);
	}
};
