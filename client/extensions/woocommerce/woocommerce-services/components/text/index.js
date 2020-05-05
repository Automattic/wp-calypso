/* eslint-disable react/no-danger */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import sanitizeHTML from 'woocommerce/woocommerce-services/lib/utils/sanitize-html';

const renderTitle = ( title ) => {
	if ( ! title ) {
		return null;
	}

	return <FormLegend dangerouslySetInnerHTML={ sanitizeHTML( title ) } />;
};

const renderText = ( text ) => {
	return <span dangerouslySetInnerHTML={ sanitizeHTML( text ) } />;
};

const Text = ( { id, title, className, value } ) => {
	return (
		<FormFieldset>
			{ renderTitle( title ) }
			<p id={ id } className={ className }>
				{ renderText( value ) }
			</p>
		</FormFieldset>
	);
};

Text.propTypes = {
	id: PropTypes.string.isRequired,
	title: PropTypes.string,
	className: PropTypes.string,
	value: PropTypes.string.isRequired,
};

export default Text;
