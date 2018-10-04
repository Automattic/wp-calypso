/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';

const ConfirmationLink = ( { text, ...props } ) => (
	<CompactCard { ...props }>
		<p className="confirmation__link">{ text }</p>
	</CompactCard>
);

ConfirmationLink.propTypes = {
	href: PropTypes.string,
	target: PropTypes.string,
	text: PropTypes.string,
};

export default ConfirmationLink;
