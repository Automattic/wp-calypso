import classNames from 'classnames';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	icon: ReactNode;
	title: string;
	description: string;
	children: ReactNode;
	isTwoColumns?: boolean;
};

export default function ListingSection( {
	icon,
	title,
	description,
	children,
	isTwoColumns,
}: Props ) {
	return (
		<div className={ classNames( 'listing-section', { 'is-two-columns': isTwoColumns } ) }>
			<h2 className="listing-section-title">
				{ icon }
				<span>{ title }</span>
			</h2>
			<p className="listing-section-description">{ description }</p>

			<div className="listing-section-content">{ children }</div>
		</div>
	);
}
