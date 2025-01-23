import { ReactNode } from 'react';

type Props = {
	id?: string;
	icon?: ReactNode;
	title: string;
	description: string;
	children: ReactNode;
	extraContent?: ReactNode;
};

export default function ProductListingSection( {
	id,
	icon,
	title,
	description,
	children,
	extraContent,
}: Props ) {
	return (
		<div id={ id } className="product-listing-section">
			<div className="product-listing-section__header-wrapper">
				<div className="product-listing-section__header">
					{ icon }
					<h2 className="product-listing-section__header-title">
						<span>{ title }</span>
					</h2>
					<span className="product-listing-section__header-subtitle">{ description }</span>
				</div>
			</div>

			{ extraContent }

			<div className="product-listing-section__content">{ children }</div>
		</div>
	);
}
