import { ReactNode } from 'react';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

interface Context {
	siteSlug: string;
	query: {
		engine: string;
	};
	primary: ReactNode;
}

type NextFunction = () => void;

/**
 * Middleware to add a page view tracker to the site importer page.
 * @param {Context} context Context object.
 */
const addTracker = ( context: Context, next: NextFunction ) => {
	const title = [ 'Site Importer', context.siteSlug, context.query.engine ?? null ]
		.filter( Boolean )
		.join( ' > ' );

	context.primary = (
		<>
			<PageViewTracker
				path="/import/:siteSlug"
				title={ title }
				properties={ { engine: context.query.engine } }
			/>
			{ context.primary }
		</>
	);

	next();
};

export default addTracker;
