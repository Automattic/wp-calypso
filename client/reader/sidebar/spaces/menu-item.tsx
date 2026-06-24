import { Icon, rss } from '@wordpress/icons';
import { MenuItem, MenuItemLink } from 'calypso/reader/sidebar/menu';
import { SPACE_ICONS } from 'calypso/reader/spaces/icons';
import { getSpacePath } from 'calypso/reader/spaces/routes';
import type { ReadSpace } from '@automattic/api-core';

interface Props {
	space: ReadSpace;
	isSelected: boolean;
	onClick: () => void;
	/** Warm the space's feed cache when the user hovers or focuses the row. */
	onPrefetch?: () => void;
}

export function SpaceMenuItem( { space, isSelected, onClick, onPrefetch }: Props ) {
	// Fall back to a generic icon when the API returns an icon key the UI
	// doesn't recognize, so the item still renders a glyph.
	const icon = SPACE_ICONS[ space.layout.icon ] ?? rss;

	return (
		<MenuItem
			selected={ isSelected }
			className={ `sidebar-spaces__item sidebar-spaces__item--${ space.layout.color }` }
		>
			<MenuItemLink
				className="sidebar__menu-link sidebar-spaces__link"
				href={ getSpacePath( space.id ) }
				onClick={ onClick }
				onMouseEnter={ onPrefetch }
				onFocus={ onPrefetch }
			>
				<span className="sidebar-spaces__icon" aria-hidden="true">
					<Icon icon={ icon } size={ 18 } />
				</span>
				<span className="sidebar-spaces__text">
					<span className="sidebar-spaces__name">{ space.name }</span>
				</span>
			</MenuItemLink>
		</MenuItem>
	);
}
