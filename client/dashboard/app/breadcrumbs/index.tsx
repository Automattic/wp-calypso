import { Breadcrumbs as BreadcrumbsComponent } from '@automattic/components/src/breadcrumbs';
import { useMatches } from '@tanstack/react-router';
import type { BreadcrumbItemProps } from '@automattic/components/src/breadcrumbs/types';

export default function Breadcrumbs() {
	const matches = useMatches();

	const items = [] as BreadcrumbItemProps[];

	let hasParent = false;
	matches.forEach( ( match ) => {
		const breadcrumbItemLabel = match.staticData?.breadcrumbItemLabel;
		if ( breadcrumbItemLabel || hasParent ) {
			items.push( {
				label: breadcrumbItemLabel?.() || '',
				href: match.pathname,
			} );
			hasParent = true;
		}
	} );

	return <BreadcrumbsComponent items={ items } />;
}
