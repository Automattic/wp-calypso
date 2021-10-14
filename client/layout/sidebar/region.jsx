import classNames from 'classnames';
import SkipNavigation from './skip-navigation';

const SidebarRegion = ( { children, className } ) => (
	<li className={ classNames( 'sidebar__region', className ) }>
		<SkipNavigation skipToElementId="primary" />
		{ children }
	</li>
);

export default SidebarRegion;
