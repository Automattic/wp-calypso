/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import paths from './paths';

/**
 * Style dependencies
 */
import './style.scss';

function ProductIcon( { className, slug } ) {
	if ( ! slug || ! paths[ slug ] ) {
		return null;
	}

	return (
		<img
			src={ paths[ slug ] }
			className={ classNames( 'product-icon', `is-${ slug }`, className ) }
			role="presentation"
			alt=""
		/>
	);
}

ProductIcon.propTypes = {
	classNames: PropTypes.string,
	slug: PropTypes.oneOf( Object.keys( paths ) ).isRequired,
};

export default ProductIcon;
