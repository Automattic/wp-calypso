import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import QueryMembershipsEarnings from 'calypso/components/data/query-memberships-earnings';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { SubscribersFilterBy, SubscribersSortBy } from 'calypso/my-sites/subscribers/constants';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { sanitizeInt } from '../../subscribers/helpers';
import SubscribersPage from '../../subscribers/main';
import { Query } from '../types';

const FILTER_KEY = 'f';
const PAGE_KEY = 'page';
const SEARCH_KEY = 's';
const SORT_KEY = 'sort';
const scrollToTop = () => window?.scrollTo( 0, 0 );

type MembersProductsSectionProps = {
	query: Query;
};

const queryStringChanged = ( key: string | number ) => ( value: string | number ) => {
	const path = window.location.pathname + window.location.search;

	scrollToTop();

	if ( ! value ) {
		return page.show( removeQueryArgs( path, key as string ) );
	}

	return page.show( addQueryArgs( path, { [ key ]: value } ) );
};

function CustomerSection( { query }: MembersProductsSectionProps ) {
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const searchTerm = query?.[ SEARCH_KEY ] ?? '';
	const filterOption = query?.[ FILTER_KEY ] ?? 'all';
	const sortTerm = query?.[ SORT_KEY ] ?? 'date_subscribed';
	const pageNumber = query?.[ PAGE_KEY ] ? ( sanitizeInt( query[ PAGE_KEY ] ) as number ) : 1;

	if ( ! site ) {
		return <LoadingEllipsis />;
	}

	return (
		<div>
			<QueryMembershipsEarnings siteId={ site?.ID } />
			<QueryMembershipsSettings siteId={ site?.ID } />
			<SubscribersPage
				filterOption={ filterOption as SubscribersFilterBy }
				pageNumber={ pageNumber }
				searchTerm={ searchTerm }
				sortTerm={ sortTerm as SubscribersSortBy }
				filterOptionChanged={ queryStringChanged( FILTER_KEY ) }
				pageChanged={ queryStringChanged( PAGE_KEY ) }
				searchTermChanged={ queryStringChanged( SEARCH_KEY ) }
				sortTermChanged={ queryStringChanged( SORT_KEY ) }
			/>
		</div>
	);
}

export default CustomerSection;
