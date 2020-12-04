/**
 * External dependencies
 */

import React from 'react';
import 'moment-timezone'; // monkey patches the existing moment.js

/**
 * Internal dependencies
 */
import FoldableCard from 'calypso/components/foldable-card';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

const ContactFormNotice = ( { showAt, hideAt, heading, message, compact } ) => {
	const moment = useLocalizedMoment();
	const currentDate = moment();

	// Don't display anything if we're before showAt or after hideAt
	if ( currentDate.isBefore( showAt ) ) {
		return null;
	}

	if ( hideAt && currentDate.isAfter( hideAt ) ) {
		return null;
	}

	if ( compact ) {
		return (
			<FoldableCard className="contact-form-notice" clickableHeader compact header={ heading }>
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
