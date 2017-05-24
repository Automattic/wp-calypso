/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';

export default function FormattedHeaderExample() {
	return (
		<FormattedHeader
			headerText="This is the header."
			subHeaderText="This is the optional subheader."
		/>
	);
}
