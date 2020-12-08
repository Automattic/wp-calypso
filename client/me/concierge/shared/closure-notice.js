/**
 * External dependencies
 */

import React from 'react';
import { useTranslate } from 'i18n-calypso';
import 'moment-timezone'; // monkey patches the existing moment.js

/**
 * Internal dependencies
 */
import { CompactCard as Card } from '@automattic/components';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

const DATE_FORMAT = 'LLL';

const ClosureNotice = ( { closesAt, displayAt, holidayName, reopensAt } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const currentDate = moment();
	const guessedTimezone = moment.tz.guess();

	if ( ! currentDate.isBetween( displayAt, reopensAt ) ) {
		return null;
	}

	let message;

	if ( currentDate.isBefore( closesAt ) ) {
		message = translate(
			'{{strong}}Note:{{/strong}} Quick Start sessions will be closed for %(holidayName)s from %(closesAt)s until %(reopensAt)s. ' +
				'If you need to get in touch with us, you’ll be able to {{link}}submit a support request{{/link}} and we’ll ' +
				'get to it as fast as we can. Thank you!',
			{
				args: {
					closesAt: moment.tz( closesAt, guessedTimezone ).format( DATE_FORMAT ),
					reopensAt: moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
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
			'{{strong}}Note:{{/strong}} Quick Start sessions are closed for %(holidayName)s and will reopen %(reopensAt)s. ' +
				'If you need to get in touch with us, you’ll be able to {{link}}submit a support request{{/link}} and we’ll ' +
				'get back to you as fast as we can. Thank you!',
			{
				args: {
					reopensAt: moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
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

export default ClosureNotice;
