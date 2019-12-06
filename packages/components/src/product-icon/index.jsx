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
	return (
		<img
			src={ paths[ slug ] }
			className={ classNames(
				'product-icon',
				`product-icon__${ slug }`,
				`is-${ slug }`,
				className
			) }
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
