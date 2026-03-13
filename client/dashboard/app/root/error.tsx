import { Suspense, lazy } from 'react';
import NotFound from '../404';

const Header = lazy( () => import( '../header' ) );

/**
 * When notFound() is called within a beforeLoad, TanStack Router will skip rendering the root route,
 * and instead render the notFoundComponent directly.
 *
 * The current workaround is to recreate the layout.
 *
 * See: https://github.com/TanStack/router/issues/2139
 */
export default function NotFoundRoot() {
	return (
		<div className="dashboard-root__layout">
			<Suspense fallback={ null }>
				<Header />
			</Suspense>
			<main>
				<NotFound />
			</main>
		</div>
	);
}
