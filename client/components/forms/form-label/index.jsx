/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import React from 'react';

const renderRequiredBadge = ( translate ) => (
	<small className="form-label__required">{ translate( 'Required' ) }</small>
);

const FormLabel = ( { children, required, translate, className, ...extraProps } ) => {
	children = React.Children.toArray( children ) || [];
	if ( required ) {
		children.push( renderRequiredBadge( translate ) );
	}

	return (
		<label { ...extraProps } className={ classnames( className, 'form-label' ) } >
			{ children.length ? children : null }
		</label>
	);
};

FormLabel.propTypes = {
	required: React.PropTypes.bool,
};

export default localize( FormLabel );
