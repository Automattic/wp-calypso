import classNames from 'classnames';
import './style.scss';

// This is meant to be the "base" sidebar component. All context-specific sidebars
// (Sites Management, Plugin Management, Purchases, non-Manage functionality)
// would use it to construct the right experience for that context.

type Props = {
	className?: string;
};
const Sidebar = ( { className }: Props ) => (
	<nav className={ classNames( 'jetpack-cloud-sidebar', className ) }>
		<header className="jetpack-cloud-sidebar__header">Header</header>
		<div className="jetpack-cloud-sidebar__main">
			<ul role="menu" className="jetpack-cloud-sidebar__navigation-list">
				<li
					className={ classNames(
						'jetpack-cloud-sidebar__navigation-item',
						'jetpack-cloud-sidebar__navigation-item--highlighted'
					) }
				>
					Navigation items
				</li>
				<li className="jetpack-cloud-sidebar__navigation-item">Will go here</li>
			</ul>
		</div>
		<div className="jetpack-cloud-sidebar__footer">Footer</div>
	</nav>
);

export default Sidebar;
