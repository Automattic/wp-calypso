/**
 * External dependencies
 */
import classNames from 'classnames';
import * as React from 'react';
import { TranslateResult } from 'i18n-calypso';

type Props = {
	title: TranslateResult;
	className?: string;
	children: React.ReactNode;
};

const ProductGridSection: React.FC< Props > = ( { title, className, children } ) => (
	<section className={ classNames( 'product-grid__section', className ) }>
		<h2 className="product-grid__section-title">{ title }</h2>
		{ children }
	</section>
);

export default ProductGridSection;
