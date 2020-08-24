/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { findKey } from 'lodash';

/**
 * Internal dependencies
 */
import { iconToProductSlugMap, paths, supportedSlugs } from './config';

/**
 * Style dependencies
 */
import './style.scss';

function ProductIcon( { className, slug } ) {
	if ( ! slug ) {
		return null;
	}

	const iconSlug = findKey( iconToProductSlugMap, ( products ) => products.includes( slug ) );
	const iconPath = paths[ iconSlug ];

	if ( ! iconPath ) {
		return null;
	}

	return (
		<img
			src={ iconPath }
			className={ classNames( 'product-icon', `is-${ iconSlug }`, className ) }
			role="presentation"
			alt=""
		/>
	);
}

ProductIcon.propTypes = {
	classNames: PropTypes.string,
	slug: PropTypes.oneOf( supportedSlugs ).isRequired,
};

export default ProductIcon;
