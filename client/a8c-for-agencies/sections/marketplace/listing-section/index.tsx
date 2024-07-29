import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	id?: string;
	icon?: ReactNode;
	title: string;
	description: string;
	children: ReactNode;
	isTwoColumns?: boolean;
	extraContent?: ReactNode;
};

export default function ListingSection( {
	id,
	icon,
	title,
	description,
	children,
	isTwoColumns,
	extraContent,
}: Props ) {
	return (
		<div id={ id } className={ clsx( 'listing-section', { 'is-two-columns': isTwoColumns } ) }>
			<h2 className="listing-section-title">
				{ icon }
				<span>{ title }</span>
			</h2>
			<p className="listing-section-description">{ description }</p>

			{ extraContent }

			<div className="listing-section-content">{ children }</div>
		</div>
	);
}
