import { Icon } from '@wordpress/components';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import './accents.scss';
import './style.scss';

export interface ShowcaseItem {
	id: string;
	/** The maker's accent key: woo, jetpack or neutral (see style.scss). */
	accent: string;
	eyebrow: string;
	glyph: JSX.Element;
	title: string;
	/** A lockup shown above the title, for items that have one. */
	lockup?: { src: string; alt: string };
	/** A sentence on what it does; shown only where the words have a column of their own. */
	description?: string;
	/** One line under the title, such as a price. */
	meta?: ReactNode;
	/** The item's drawing. */
	art: ReactNode;
	/** The tile's action, under the words (a link-style Button). */
	action?: ReactNode;
	/** A second action beside it, such as "View details". */
	secondaryAction?: ReactNode;
	/** Opens the item; the whole tile is the target. */
	onOpen: () => void;
}

/**
 * The featured level of an A4A page (A4AD-237): a bento of tiles, each one the
 * item's words beside its drawing. The first tile leads on the maker's full
 * colour; every other tile takes the maker's tint. Tiles pair up wide-narrow,
 * then narrow-wide, and a tile left alone on the last row takes the full width,
 * so any number of items lays out. See style.scss for the composition rules.
 */
export default function Showcase( { items }: { items: ShowcaseItem[] } ) {
	return (
		<ul className="dashboard-showcase">
			{ items.map( ( item, index ) => (
				<li
					key={ item.id }
					className={ clsx( 'dashboard-showcase__tile', { 'is-lead': index === 0 } ) }
					data-accent={ item.accent }
				>
					<div className="dashboard-showcase__body">
						<div className="dashboard-showcase__text">
							<span className="dashboard-showcase__eyebrow">
								<span className="dashboard-showcase__glyph">
									<Icon icon={ item.glyph } size={ 16 } />
								</span>
								<span>{ item.eyebrow }</span>
							</span>
							{ item.lockup && (
								<span className="dashboard-showcase__lockup">
									<img src={ item.lockup.src } alt={ item.lockup.alt } />
								</span>
							) }
							<button type="button" className="dashboard-showcase__title" onClick={ item.onOpen }>
								{ item.title }
							</button>
							{ item.description && (
								<span className="dashboard-showcase__description">{ item.description }</span>
							) }
							{ item.meta && <span className="dashboard-showcase__meta">{ item.meta }</span> }
						</div>
						<div className="dashboard-showcase__art" aria-hidden="true">
							<div className="dashboard-showcase__object">{ item.art }</div>
						</div>
						{ item.action && (
							<div className="dashboard-showcase__action">
								{ item.action }
								{ item.secondaryAction }
							</div>
						) }
					</div>
				</li>
			) ) }
		</ul>
	);
}
