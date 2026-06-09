import { Icon } from '@wordpress/icons';
import { MenuItem, MenuItemLink } from 'calypso/reader/sidebar/menu';
import { getSpacePath, type Space } from 'calypso/reader/spaces/spaces-data';

interface Props {
	space: Space;
	isSelected: boolean;
	onClick: () => void;
}

export function SpaceMenuItem( { space, isSelected, onClick }: Props ) {
	return (
		<MenuItem
			selected={ isSelected }
			className={ `sidebar-spaces__item sidebar-spaces__item--${ space.color }` }
		>
			<MenuItemLink
				className="sidebar__menu-link sidebar-spaces__link"
				href={ getSpacePath( space.id ) }
				onClick={ onClick }
			>
				<span className="sidebar-spaces__icon" aria-hidden="true">
					<Icon icon={ space.icon } size={ 18 } />
				</span>
				<span className="sidebar-spaces__text">
					<span className="sidebar-spaces__name">{ space.name }</span>
				</span>
			</MenuItemLink>
		</MenuItem>
	);
}
