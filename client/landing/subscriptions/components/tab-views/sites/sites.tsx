import config from '@automattic/calypso-config';
import { SubscriptionManager } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice } from 'calypso/landing/subscriptions/components/notice';
import { SiteList } from 'calypso/landing/subscriptions/components/site-list';
import { SortControls, Option } from 'calypso/landing/subscriptions/components/sort-controls';
import TabView from '../tab-view';

const SortBy = SubscriptionManager.SiteSubscriptionsSortBy;

const isSearchEnabled = config.isEnabled( 'subscription-management/sites-search' );

const sortOptions: Option[] = [
	{ value: SortBy.LastUpdated, label: 'Last updated' },
	{ value: SortBy.DateSubscribed, label: 'Date subscribed' },
	{ value: SortBy.SiteName, label: 'Site name' },
];

const Sites = () => {
	const translate = useTranslate();
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 300 );
	const [ sortTerm, setSortTerm ] = useState( SortBy.LastUpdated );
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery( {
		searchTerm: debouncedSearchTerm,
		sortTerm,
	} );
	const { subscriptions, totalCount } = data ?? {};
	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscriptions.' : '';

	if ( ! isLoading && ! totalCount ) {
		return <Notice type="warning">{ translate( 'You are not subscribed to any sites.' ) }</Notice>;
	}

	const handleSearch = ( value: string ) => {
		setSearchTerm( value );
	};

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isLoading }>
			{ isSearchEnabled && (
				<div className="subscriptions-manager__list-actions-bar">
					<SearchInput
						placeholder={ translate( 'Search by site name or address…' ) }
						searchIcon={ <SearchIcon size={ 18 } /> }
						onSearch={ handleSearch }
					/>
					<SortControls value={ sortTerm } onChange={ setSortTerm } options={ sortOptions } />
				</div>
			) }

			<SiteList sites={ subscriptions } />

			{ totalCount > 0 && subscriptions.length === 0 && (
				<Notice type="warning">
					{ translate( 'Sorry, no sites match {{italic}}%s.{{/italic}}', {
						components: { italic: <i /> },
						args: debouncedSearchTerm,
					} ) }
				</Notice>
			) }
		</TabView>
	);
};

export default Sites;
