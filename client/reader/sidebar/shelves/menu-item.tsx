import { Icon, rss } from '@wordpress/icons';
import { resolveShelfIconColor } from 'calypso/reader/shelves/colors';
import { SHELF_ICONS } from 'calypso/reader/shelves/icons';
import { getShelfPath } from 'calypso/reader/shelves/routes';
import { MenuItem, MenuItemLink } from 'calypso/reader/sidebar/menu';
import type { ReadShelf } from '@automattic/api-core';

interface Props {
	shelf: ReadShelf;
	isSelected: boolean;
	onClick: () => void;
	/** Warm the shelf's feed cache when the user hovers or focuses the row. */
	onPrefetch?: () => void;
}

export function ShelfMenuItem( { shelf, isSelected, onClick, onPrefetch }: Props ) {
	// Fall back to a generic icon when the API returns an icon key the UI
	// doesn't recognize, so the item still renders a glyph.
	const icon = SHELF_ICONS[ shelf.layout.icon ] ?? rss;

	return (
		<MenuItem
			selected={ isSelected }
			className={ `sidebar-shelves__item sidebar-shelves__item--${ resolveShelfIconColor(
				shelf.layout
			) }` }
		>
			<MenuItemLink
				className="sidebar__menu-link sidebar-shelves__link"
				href={ getShelfPath( shelf.slug ) }
				onClick={ onClick }
				onMouseEnter={ onPrefetch }
				onFocus={ onPrefetch }
			>
				<span className="sidebar-shelves__icon" aria-hidden="true">
					<Icon icon={ icon } size={ 18 } />
				</span>
				<span className="sidebar-shelves__text">
					<span className="sidebar-shelves__name">{ shelf.name }</span>
				</span>
			</MenuItemLink>
		</MenuItem>
	);
}
