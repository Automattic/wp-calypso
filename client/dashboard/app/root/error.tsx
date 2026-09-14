import { useCallback, useState } from 'react';
import NotFound from '../404';
import { useOmnibarEvent } from '../omnibar/events';
import ResponsiveSidebar from '../responsive-sidebar';

/**
 * When notFound() is called within a beforeLoad, TanStack Router will skip rendering the root route,
 * and instead render the notFoundComponent directly.
 *
 * The current workaround is to recreate the layout body. The omnibar is mounted
 * outside the router and stays visible as the top bar.
 *
 * See: https://github.com/TanStack/router/issues/2139
 */
export default function NotFoundRoot() {
	const [ isSidebarOpen, setIsSidebarOpen ] = useState( false );
	const closeSidebar = useCallback( () => setIsSidebarOpen( false ), [] );
	useOmnibarEvent( 'mobileMenu', () => setIsSidebarOpen( ( v ) => ! v ) );

	return (
		<div className="dashboard-root__layout">
			<div className="dashboard-root__body">
				<ResponsiveSidebar isOpen={ isSidebarOpen } onClose={ closeSidebar } />
				<div className="dashboard-root__content">
					<main>
						<NotFound />
					</main>
				</div>
			</div>
		</div>
	);
}
