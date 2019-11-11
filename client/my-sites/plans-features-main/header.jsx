/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

const PlansFeaturesMainHeader = ( { heading, subhead } ) => (
	<div className="plans-features-main__header">
		<h2 className="plans-features-main__heading">{ heading }</h2>
		{ subhead && <p className="plans-features-main__subhead">{ subhead }</p> }
	</div>
);

PlansFeaturesMainHeader.propTypes = {
	heading: PropTypes.string.isRequired,
	subhead: PropTypes.string,
};

PlansFeaturesMainHeader.defaultProps = {
	heading: '',
	subhead: null,
};

export default PlansFeaturesMainHeader;
