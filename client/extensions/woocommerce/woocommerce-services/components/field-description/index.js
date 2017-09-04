/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const FieldDescription = ( { text } ) => {
	return (
		text ? <FormSettingExplanation>{ text }</FormSettingExplanation> : null
	);
};

FieldDescription.propTypes = {
	text: PropTypes.string,
};

export default FieldDescription;
