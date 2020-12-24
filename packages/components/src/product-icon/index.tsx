/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { findKey } from 'lodash';

/**
 * Internal dependencies
 */
import { iconToProductSlugMap, paths } from './config';
import type { SupportedSlugs } from './config';

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	className?: string;
	slug: SupportedSlugs;
};

function ProductIcon( { className, slug }: Props ): JSX.Element | null {
	if ( ! slug ) {
		return null;
	}

	const iconSlug = findKey( iconToProductSlugMap, ( products ) =>
		products.includes( slug )
	) as keyof typeof paths;

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

export default ProductIcon;
