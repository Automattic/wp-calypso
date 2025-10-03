import { Breadcrumbs as BreadcrumbsComponent } from '@automattic/components/src/breadcrumbs';
import { useMatches } from '@tanstack/react-router';
import type { BreadcrumbItemProps } from '@automattic/components/src/breadcrumbs/types';

export default function Breadcrumbs( { length }: { length: number } ) {
	const matches = useMatches();

	const items: BreadcrumbItemProps[] = matches.slice( -length ).map( ( match ) => {
		const title = match.meta?.find( ( meta ) => meta?.title )?.title;
		return {
			label: title || '',
			href: match.pathname,
		};
	} );

	return <BreadcrumbsComponent items={ items } />;
}
