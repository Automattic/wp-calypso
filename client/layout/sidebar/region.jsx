import clsx from 'clsx';
import SkipNavigation from './skip-navigation';

const SidebarRegion = ( { children, className = '' } ) => (
	<li className={ clsx( 'sidebar__region', className ) }>
		<SkipNavigation skipToElementId="primary" />
		{ children }
	</li>
);

export default SidebarRegion;
