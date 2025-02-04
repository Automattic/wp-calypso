import clsx from 'clsx';
import { TranslateResult } from 'i18n-calypso';
import * as React from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

type Props = {
	title?: TranslateResult;
	className?: string;
	children: React.ReactNode;
};

const ProductGridSection: React.FC< Props > = ( { title, className, children } ) => (
	<section
		className={ clsx( 'product-grid__section', className, {
			'is-jetpack-cloud': isJetpackCloud(),
		} ) }
	>
		{ title && <h2 className="product-grid__section-title">{ title }</h2> }
		{ children }
	</section>
);

export default ProductGridSection;
