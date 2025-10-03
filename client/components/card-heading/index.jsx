import clsx from 'clsx';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { createElement } from 'react';

import './style.scss';

//Sizes 47, 21, and 11 are deprecated; use the nearest equivalent
const validTypeSizes = [ 54, 48, 47, 36, 32, 24, 21, 20, 16, 14, 12, 11 ];

function CardHeading( { tagName = 'h1', size = 20, isBold = false, className, id, children } ) {
	const classNameObject = {};
	classNameObject[ 'card-heading-' + size ] = includes( validTypeSizes, size );
	const classes = clsx(
		'card-heading',
		isBold && 'card-heading__bold',
		className && className,
		classNameObject
	);
	return createElement( tagName, { className: classes, id }, children );
}

CardHeading.propTypes = {
	tagName: PropTypes.string,
	size: PropTypes.number,
	isBold: PropTypes.bool,
	className: PropTypes.string,
	id: PropTypes.string,
};

export default CardHeading;
