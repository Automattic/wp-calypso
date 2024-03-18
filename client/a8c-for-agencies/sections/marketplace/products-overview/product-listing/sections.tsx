import classNames from 'classnames';
import { ReactNode } from 'react';

type Props = {
	title: string;
	description: string;
	children: ReactNode;
	isTwoColumns?: boolean;
};

export default function ProductListingSection( {
	title,
	description,
	children,
	isTwoColumns,
}: Props ) {
	return (
		<div className={ classNames( 'product-listing__section', { 'is-two-columns': isTwoColumns } ) }>
			<h2 className="product-listing__section-title">
				<span>{ title }</span>
				<hr />
			</h2>
			<p className="product-listing__section-description">{ description }</p>

			<div className="product-listing__section-content">{ children }</div>
		</div>
	);
}
