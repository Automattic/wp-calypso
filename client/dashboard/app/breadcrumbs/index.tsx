import { Breadcrumbs as BreadcrumbsComponent } from '@automattic/components/src/breadcrumbs';
import { useMatches } from '@tanstack/react-router';
import type { BreadcrumbItemProps } from '@automattic/components/src/breadcrumbs/types';

export default function Breadcrumbs() {
	const matches = useMatches();

	const items = [] as BreadcrumbItemProps[];

	let hasParent = false;
	matches.forEach( ( match ) => {
		if ( match.loaderData?.breadcrumbItemLabel || hasParent ) {
			items.push( {
				label: match.loaderData?.breadcrumbItemLabel || '',
				href: match.pathname,
			} );
			hasParent = true;
		}
	} );

	return <BreadcrumbsComponent items={ items } />;
}
