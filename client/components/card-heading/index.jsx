/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { includes } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { preventWidows } from 'lib/formatting';

const validTypeSizes = [ 54, 47, 36, 32, 24, 21, 16, 14, 11 ];
const validTagNames = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];

function CardHeading( { tagName = 'h1', size = 21, children } ) {
	const classNameObject = {};
	classNameObject[ 'card-heading-' + size ] = includes( validTypeSizes, size );
	const classes = classNames( 'card-heading', classNameObject );
	return React.createElement( tagName, { className: classes }, preventWidows( children, 2 ) );
}

CardHeading.propTypes = {
	tagName: PropTypes.oneOf( validTagNames ),
	size: PropTypes.oneOf( validTypeSizes ),
};

export default CardHeading;
