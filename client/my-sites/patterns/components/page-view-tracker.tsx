import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

type PatternsPageViewTrackerProps = {
	category: string;
	searchTerm: string;
};

export function PatternsPageViewTracker( { category, searchTerm }: PatternsPageViewTrackerProps ) {
	const isLoggedIn = useSelector( isUserLoggedIn );

	let path: string = '';
	const properties: Record< string, string > = {
		is_logged_in: isLoggedIn ? '1' : '0',
	};

	if ( ! category ) {
		path = searchTerm ? '/patterns/:search' : '/patterns';
	} else {
		path = searchTerm ? '/patterns/:category/:search' : '/patterns/:category';
		properties.category = category;
	}

	if ( searchTerm ) {
		properties.search_term = searchTerm;
	}

	const key = path + category + searchTerm;

	return (
		<PageViewTracker key={ key } path={ path } properties={ properties } title="Pattern Library" />
	);
}
