import { Breadcrumbs as BreadcrumbsComponent } from '@automattic/components/src/breadcrumbs';
import { useMatches, Link } from '@tanstack/react-router';
import { usePreviousLocation } from './context';
import type { BreadcrumbItemProps } from '@automattic/components/src/breadcrumbs/types';

interface BreadcrumbsProps {
	/**
	 * The number of crumbs to display in the breadcrumb.
	 * Important: the current page is visibly hidden but still counts towards
	 * the length. If length is set to `3` then only 2 will be visible on
	 * screen, but all 3 will be presented by accessible technology.
	 */
	length: number;
}

export function Breadcrumbs( { length }: BreadcrumbsProps ) {
	const matches = useMatches();
	const previousLocation = usePreviousLocation();

	const items: BreadcrumbItemProps[] = matches
		.map( ( match ) => {
			const title = match.meta?.find( ( meta ) => meta?.title )?.title;
			return {
				label: title || '',
				href: match.pathname,
			};
		} )
		.filter( ( { label } ) => Boolean( label ) )
		.slice( -length );

	const previousLocationItem = items.at( items.length - 2 );

	const cameFromPreviousLocation = previousLocation?.pathname === previousLocationItem?.href;

	return (
		<BreadcrumbsComponent
			items={ items }
			renderItemLink={ ( { href, label, ...rest } ) => {
				const isPreviousLocation = href === previousLocationItem?.href;

				const search = isPreviousLocation && cameFromPreviousLocation && previousLocation?.search;

				return (
					<Link to={ href } search={ search } { ...rest }>
						{ label }
					</Link>
				);
			} }
		/>
	);
}
