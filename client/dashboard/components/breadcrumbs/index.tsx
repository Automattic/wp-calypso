import { Breadcrumbs } from '@automattic/components/src/breadcrumbs';
import { Link } from '@tanstack/react-router';

interface DashboardBreadcrumbsProps {
	items: Array< {
		label: string;
		path: string;
	} >;
}

export default function DashboardBreadcrumbs( { items }: DashboardBreadcrumbsProps ) {
	if ( items.length === 0 ) {
		return null;
	}

	// Convert the items to the format expected by @automattic/components Breadcrumbs
	const breadcrumbItems = items.map( ( item ) => ( {
		label: item.label,
		href: item.path,
	} ) );

	return (
		<Breadcrumbs
			items={ breadcrumbItems }
			variant="default"
			renderItemLink={ ( { href, label, ...rest } ) => (
				<Link to={ href } { ...rest }>
					{ label }
				</Link>
			) }
		/>
	);
}
