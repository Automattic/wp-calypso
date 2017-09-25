/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { isObject, omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

const renderRequiredBadge = translate =>
	<small className="form-label__required">
		{ translate( 'Required' ) }
	</small>;

const addKeys = elements =>
	elements.map( ( elem, idx ) => ( isObject( elem ) ? { ...elem, key: idx } : elem ) );

const FormLabel = ( { children, required, translate, className, ...extraProps } ) => {
	children = React.Children.toArray( children ) || [];
	if ( required ) {
		children.push( renderRequiredBadge( translate ) );
	}

	return (
		<label
			{ ...omit( extraProps, 'moment', 'numberFormat' ) }
			className={ classnames( className, 'form-label' ) }
		>
			{ children.length ? addKeys( children ) : null }
		</label>
	);
};

FormLabel.propTypes = {
	required: PropTypes.bool,
};

export default localize( FormLabel );
