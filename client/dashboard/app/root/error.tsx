import NotFound from '../404';
import Header from '../header';

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
			<Header />
			<main>
				<NotFound />
			</main>
		</div>
	);
}
