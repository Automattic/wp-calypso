/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import React from 'react';

const FormLabel = ( { children, required, translate, className, ...extraProps } ) => {
	return (
		<label { ...extraProps } className={ classnames( className, 'form-label' ) } >
			{ children }
			{ required && <small className="form-label__required">{ translate( 'Required' ) }</small> }
		</label>
	);
};

FormLabel.propTypes = {
	required: React.PropTypes.bool,
};

export default localize( FormLabel );
