import config from '@automattic/calypso-config';
import { SubscriptionManager } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice } from 'calypso/landing/subscriptions/components/notice';
import { SiteList } from 'calypso/landing/subscriptions/components/site-list';
import { SortControls, Option } from 'calypso/landing/subscriptions/components/sort-controls';
import { useSearch } from 'calypso/landing/subscriptions/hooks';
import TabView from '../tab-view';

const SortBy = SubscriptionManager.SiteSubscriptionsSortBy;

const getSortOptions = ( translate: ReturnType< typeof useTranslate > ): Option[] => [
	{ value: SortBy.LastUpdated, label: translate( 'Recently updated' ) },
	{ value: SortBy.DateSubscribed, label: translate( 'Recently subscribed' ) },
	{ value: SortBy.SiteName, label: translate( 'Site name' ) },
];

const useSortOptions = ( translate: ReturnType< typeof useTranslate > ): Option[] =>
	useMemo( () => getSortOptions( translate ), [ translate ] );

const Sites = () => {
	const translate = useTranslate();
	const { searchTerm, handleSearch } = useSearch();
	const [ sortTerm, setSortTerm ] = useState( SortBy.DateSubscribed );
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery( {
		searchTerm,
		sortTerm,
	} );
	const { subscriptions, totalCount } = data ?? {};
	const sortOptions = useSortOptions( translate );
	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscriptions.' : '';
	const isListControlsEnabled = config.isEnabled( 'subscription-management/sites-list-controls' );

	if ( ! isLoading && ! totalCount ) {
		return <Notice type="warning">{ translate( 'You are not subscribed to any sites.' ) }</Notice>;
	}

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isLoading }>
			{ isListControlsEnabled && (
				<div className="subscriptions-manager__list-actions-bar">
					<SearchInput
						placeholder={ translate( 'Search by site name or address…' ) }
						searchIcon={ <SearchIcon size={ 18 } /> }
						onSearch={ handleSearch }
					/>
					<SortControls options={ sortOptions } value={ sortTerm } onChange={ setSortTerm } />
				</div>
			) }

			<SiteList sites={ subscriptions } />

			{ totalCount > 0 && subscriptions.length === 0 && (
				<Notice type="warning">
					{ translate( 'Sorry, no sites match {{italic}}%s.{{/italic}}', {
						components: { italic: <i /> },
						args: searchTerm,
					} ) }
				</Notice>
			) }
		</TabView>
	);
};

export default Sites;
