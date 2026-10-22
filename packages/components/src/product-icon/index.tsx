import clsx from 'clsx';
import * as React from 'react';
import { iconToProductSlugMap, paths } from './config';

import './style.scss';

type Props = {
	className?: string;
	slug: string;
};

const ProductIcon: React.FunctionComponent< Props > = ( { className, slug } ) => {
	if ( ! slug ) {
		return null;
	}

	const iconSlug = (
		Object.keys( iconToProductSlugMap ) as ( keyof typeof iconToProductSlugMap )[]
	 ).find( ( key ) =>
		( iconToProductSlugMap[ key ] as readonly string[] ).includes( slug )
	) as keyof typeof paths;

	const iconPath = paths[ iconSlug ];

	if ( ! iconPath ) {
		return null;
	}

	return (
		<img
			src={ iconPath }
			className={ clsx( 'product-icon', `is-${ iconSlug }`, className ) }
			role="presentation"
			alt=""
		/>
	);
};

export default ProductIcon;
