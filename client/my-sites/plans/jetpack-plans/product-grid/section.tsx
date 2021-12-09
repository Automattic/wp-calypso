import classNames from 'classnames';
import { TranslateResult } from 'i18n-calypso';
import * as React from 'react';

type Props = {
	title?: TranslateResult;
	className?: string;
	children: React.ReactNode;
};

const ProductGridSection: React.FC< Props > = ( { title, className, children } ) => (
	<section className={ classNames( 'product-grid__section', className ) }>
		{ title && <h2 className="product-grid__section-title">{ title }</h2> }
		{ children }
	</section>
);

export default ProductGridSection;
