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
		<MenuItem selected={ isSelected } className="reader-sidebar-spaces__item">
			<MenuItemLink
				className="sidebar__menu-link reader-sidebar-spaces__link"
				href={ getSpacePath( space.slug ) }
				onClick={ onClick }
			>
				<span
					className={ `reader-sidebar-spaces__icon reader-sidebar-spaces__icon--${ space.color }` }
					aria-hidden="true"
				>
					<Icon icon={ space.icon } size={ 18 } />
				</span>
				<span className="reader-sidebar-spaces__text">
					<span className="reader-sidebar-spaces__name">{ space.name }</span>
					<span className="reader-sidebar-spaces__meta">{ space.lastActivityLabel }</span>
				</span>
				{ space.unreadCount > 0 && (
					<span className="reader-sidebar-spaces__count">{ space.unreadCount }</span>
				) }
			</MenuItemLink>
		</MenuItem>
	);
}
