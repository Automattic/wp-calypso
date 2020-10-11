/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import './style.scss';

type Props = {
	className?: string;
};

const ProductCardPlaceholder: FunctionComponent< Props > = ( { className } ) => {
	return <div className={ classNames( className, 'product-card-placeholder' ) }></div>;
};

export default ProductCardPlaceholder;
