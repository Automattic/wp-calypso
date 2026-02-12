import { Breadcrumbs as BreadcrumbsComponent } from '@automattic/components/src/breadcrumbs';
import { useMatches, Link } from '@tanstack/react-router';
import { getTransientQueryParamsAtPathname } from '../transient-query-params';
import type { BreadcrumbItemProps } from '@automattic/components/src/breadcrumbs/types';

interface BreadcrumbsProps {
	/**
	 * The number of crumbs to display in the breadcrumb.
	 * Important: the current page is visibly hidden but still counts towards
	 * the length. If length is set to `3` then only 2 will be visible on
	 * screen, but all 3 will be presented by accessible technology.
	 */
	length: number;
	/**
	 * Optional callback function that is called when a breadcrumb item is clicked.
	 * Receives the href and label of the clicked item.
	 */
	onItemClick?: ( href: string, label: string ) => void;
}

export default function Breadcrumbs( { length, onItemClick }: BreadcrumbsProps ) {
	const matches = useMatches();

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

	return (
		<BreadcrumbsComponent
			items={ items }
			renderItemLink={ ( { href, label, ...rest } ) => (
				<Link
					to={ href }
					search={ getTransientQueryParamsAtPathname( href ) }
					onClick={ () => onItemClick?.( href, label ) }
					{ ...rest }
				>
					{ label }
				</Link>
			) }
		/>
	);
}
