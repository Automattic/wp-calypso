/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { isObject, omit } from 'lodash';

/**
 * Style dependencies
 */
import './style.scss';

const renderRequiredBadge = translate => (
	<small className="form-label__required">{ translate( 'Required' ) }</small>
);

const renderOptionalBadge = translate => (
	<small className="form-label__optional">{ translate( 'Optional' ) }</small>
);

const addKeys = elements =>
	elements.map( ( elem, idx ) => ( isObject( elem ) ? { ...elem, key: idx } : elem ) );

const FormLabel = ( { children, required, optional, translate, className, ...extraProps } ) => {
	children = React.Children.toArray( children ) || [];
	if ( required ) {
		children.push( renderRequiredBadge( translate ) );
	}

	if ( optional ) {
		children.push( renderOptionalBadge( translate ) );
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
