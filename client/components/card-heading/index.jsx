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

/**
 * Style dependencies
 */
import './style.scss';

const validTypeSizes = [ 54, 47, 36, 32, 24, 21, 16, 14, 11 ];

function CardHeading( { tagName = 'h1', size = 21, children } ) {
	const classNameObject = {};
	classNameObject[ 'card-heading-' + size ] = includes( validTypeSizes, size );
	const classes = classNames( 'card-heading', classNameObject );
	return React.createElement( tagName, { className: classes }, preventWidows( children, 2 ) );
}

CardHeading.propTypes = {
	tagName: PropTypes.string,
	size: PropTypes.number,
};

export default CardHeading;
