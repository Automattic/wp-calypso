import { ReactNode } from 'react';

type Props = {
	icon?: ReactNode;
	title: string;
	description?: string;
	children: ReactNode;
	extraContent?: ReactNode;
};

export default function ProductListingSection( {
	icon,
	title,
	description,
	children,
	extraContent,
}: Props ) {
	return (
		<div className="product-listing-section">
			<div className="product-listing-section__header-wrapper">
				<div className="product-listing-section__header">
					{ icon }
					<h2 className="product-listing-section__header-title">{ title }</h2>
					{ description && (
						<span className="product-listing-section__header-subtitle">{ description }</span>
					) }
				</div>
			</div>

			{ extraContent }

			<div className="product-listing-section__content">{ children }</div>
		</div>
	);
}
