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
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';

//Sizes 47, 21, and 11 are deprecated; use the nearest equivalent
const validTypeSizes = [ 54, 48, 47, 36, 32, 24, 21, 20, 16, 14, 12, 11 ];

function CardHeading( { tagName = 'h1', size = 20, isBold = false, className, children } ) {
	const classNameObject = {};
	classNameObject[ 'card-heading-' + size ] = includes( validTypeSizes, size );
	const classes = classNames(
		'card-heading',
		isBold && 'card-heading__bold',
		className && className,
		classNameObject
	);
	return React.createElement( tagName, { className: classes }, preventWidows( children, 2 ) );
}

CardHeading.propTypes = {
	tagName: PropTypes.string,
	size: PropTypes.number,
	isBold: PropTypes.bool,
	className: PropTypes.string,
};

export default CardHeading;
