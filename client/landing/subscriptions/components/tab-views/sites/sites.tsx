import config from '@automattic/calypso-config';
import { SubscriptionManager, Reader } from '@automattic/data-stores';
import { SiteSubscriptionsFilterBy } from '@automattic/data-stores/src/reader/queries';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import SelectDropdown from 'calypso/components/select-dropdown';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { SiteList } from 'calypso/landing/subscriptions/components/site-list';
import { SortControls, Option } from 'calypso/landing/subscriptions/components/sort-controls';
import { useSearch } from 'calypso/landing/subscriptions/hooks';
import { getFilterLabel, useFilterOptions } from '../tab-filters/tab-filters';
import TabView from '../tab-view';

const SortBy = Reader.SiteSubscriptionsSortBy;

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
	const availableFilterOptions = useFilterOptions();
	const [ filterOption, setFilterOption ] = useState< SiteSubscriptionsFilterBy >(
		SiteSubscriptionsFilterBy.All
	);
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery( {
		searchTerm,
		sortTerm,
		filterOption,
	} );
	const { subscriptions, totalCount } = data ?? {};
	const sortOptions = useSortOptions( translate );
	const errorMessage = error
		? translate( "Oops! The subscription couldn't be found or doesn't exist." )
		: '';
	const isListControlsEnabled = config.isEnabled( 'subscription-management/sites-list-controls' );

	if ( ! isLoading && ! totalCount ) {
		return (
			<Notice type={ NoticeType.Warning }>
				{ translate( 'You are not subscribed to any sites.' ) }
			</Notice>
		);
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

					<SelectDropdown
						className="subscriptions-manager__filter-control subscriptions-manager__list-actions-bar-spacer"
						options={ availableFilterOptions }
						onSelect={ ( selectedOption: Option ) =>
							setFilterOption( selectedOption.value as SiteSubscriptionsFilterBy )
						}
						selectedText={ translate( 'View: %s', {
							args: getFilterLabel( availableFilterOptions, filterOption ) || '',
						} ) }
					/>

					<SortControls options={ sortOptions } value={ sortTerm } onChange={ setSortTerm } />
				</div>
			) }

			<SiteList sites={ subscriptions } />

			{ totalCount > 0 && subscriptions.length === 0 && (
				<Notice type={ NoticeType.Warning }>
					{ translate( 'Sorry, no sites match {{italic}}%s.{{/italic}}', {
						components: { italic: <i /> },
						args: searchTerm || filterOption,
					} ) }
				</Notice>
			) }
		</TabView>
	);
};

export default Sites;
