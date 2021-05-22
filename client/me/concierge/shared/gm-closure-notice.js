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

const DATE_FORMAT = 'dddd, MMMM Do LT';

const GMClosureNotice = ( { closesAt, displayAt, reopensAt } ) => {
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
			'{{strong}}Note:{{/strong}} Support sessions will not be available between %(closesAt)s and %(reopensAt)s.',
			{
				args: {
					closesAt: moment.tz( closesAt, guessedTimezone ).format( DATE_FORMAT ),
					reopensAt: moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
				},
				components: {
					strong: <strong />,
				},
			}
		);
	} else {
		message = translate(
			'{{strong}}Note:{{/strong}} Support sessions are not available before %(reopensAt)s.',
			{
				args: {
					reopensAt: moment.tz( reopensAt, guessedTimezone ).format( DATE_FORMAT ),
				},
				components: {
					strong: <strong />,
				},
			}
		);
	}

	const reason = translate(
		'Why? Once a year, the WordPress.com Happiness Engineers and the rest of the WordPress.com family get together to work on improving our services, building new features, and learning how to better serve our customers like you. But never fear! If you need help in the meantime, you can submit an email ticket through the contact form: {{contactLink}}https://wordpress.com/help/contact{{/contactLink}}',
		{
			components: {
				contactLink: <a href="/help/contact" />,
			},
		}
	);

	return (
		<Card>
			<p>{ message }</p>
			<p>{ reason }</p>
		</Card>
	);
};

export default GMClosureNotice;
