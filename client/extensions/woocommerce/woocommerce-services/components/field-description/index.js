/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import sanitizeHTML from 'woocommerce/woocommerce-services/lib/utils/sanitize-html';

const FieldDescription = ( { text } ) => {
	return text ? <FormSettingExplanation dangerouslySetInnerHTML={ sanitizeHTML( text ) } /> : null;
};

FieldDescription.propTypes = {
	text: PropTypes.string,
};

export default FieldDescription;
