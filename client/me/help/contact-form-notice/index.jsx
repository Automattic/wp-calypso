/**
 * External dependencies
 */

import React from 'react';
import 'moment-timezone'; // monkey patches the existing moment.js

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import FormSectionHeading from 'components/forms/form-section-heading';
import { useLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

const ContactFormNotice = ( { showAt, hideAt, heading, message, compact } ) => {
	const moment = useLocalizedMoment();
	const currentDate = moment();

	if ( ! currentDate.isBetween( showAt, hideAt ) ) {
		return null;
	}

	if ( compact ) {
		return (
			<FoldableCard
				className="contact-form-notice"
				clickableHeader={ true }
				compact={ true }
				header={ heading }
			>
				{ message }
			</FoldableCard>
		);
	}

	return (
		<div className="contact-form-notice">
			<FormSectionHeading>{ heading }</FormSectionHeading>
			<div>{ message }</div>
			<hr />
		</div>
	);
};

export default ContactFormNotice;
