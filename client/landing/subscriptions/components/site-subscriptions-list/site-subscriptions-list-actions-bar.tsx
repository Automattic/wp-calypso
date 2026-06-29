import { SelectDropdown } from '@automattic/components';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { SortControls, Option } from 'calypso/landing/subscriptions/components/sort-controls';
import { getOptionLabel } from 'calypso/landing/subscriptions/helpers';
import { useSiteSubscriptionsFilterOptions } from 'calypso/landing/subscriptions/hooks';
import './styles/site-subscriptions-list-actions-bar.scss';

const { SiteSubscriptionsSortBy: SortBy } = Reader;

const getSortOptions = ( translate: ReturnType< typeof useTranslate > ) => [
	{ value: SortBy.LastUpdated, label: translate( 'Recently updated' ) },
	{ value: SortBy.DateSubscribed, label: translate( 'Recently subscribed' ) },
	{ value: SortBy.SiteName, label: translate( 'Site name' ) },
];

const ListActionsBar = () => {
	const translate = useTranslate();
	const { searchTerm, setSearchTerm, sortTerm, setSortTerm, filterOption, setFilterOption } =
		SubscriptionManager.useSiteSubscriptionsQueryProps();

	const filterOptions = useSiteSubscriptionsFilterOptions();
	const sortOptions = useMemo( () => getSortOptions( translate ), [ translate ] );
	const { data, isLoading } = SubscriptionManager.useSiteSubscriptionsQuery();
	const visibleCount = data.subscriptions.filter(
		( subscription ) => ! subscription.isDeleted
	).length;
	const isSortDisabled = ! isLoading && visibleCount === 0;
	const isFilterDisabled = ! isLoading && ! data.hasSearchMatchesWithAllFilter;
	const disabledReasonText = translate( 'No subscribed sites match your search.', {
		textOnly: true,
	} );
	const filterLabel = getOptionLabel( filterOptions, filterOption ) || '';
	const sortLabel = getOptionLabel( sortOptions, sortTerm ) || '';

	return (
		<div className="site-subscriptions-list-actions-bar">
			<SearchInput
				delaySearch
				placeholder={ translate( 'Search by site name or address…' ) }
				searchIcon={ <SearchIcon size={ 18 } /> }
				onSearch={ setSearchTerm }
				defaultValue={ searchTerm }
			/>

			<SelectDropdown
				className="list-actions-bar__filter-control list-actions-bar__spacer"
				options={ filterOptions }
				disabled={ isFilterDisabled }
				onSelect={ ( selectedOption: Option< Reader.SiteSubscriptionsFilterBy > ) =>
					setFilterOption( selectedOption.value )
				}
				selectedText={ translate( 'View: %s', {
					args: filterLabel,
				} ) }
				ariaLabel={
					isFilterDisabled
						? translate( 'View: %(filter)s. %(reason)s', {
								args: {
									filter: filterLabel,
									reason: disabledReasonText,
								},
								textOnly: true,
						  } )
						: undefined
				}
			/>

			<SortControls
				options={ sortOptions }
				value={ sortTerm }
				onChange={ setSortTerm }
				disabled={ isSortDisabled }
				ariaLabel={
					isSortDisabled
						? translate( 'Sort: %(sortingLabel)s. %(reason)s', {
								args: {
									sortingLabel: sortLabel,
									reason: disabledReasonText,
								},
								textOnly: true,
						  } )
						: undefined
				}
				title={ isSortDisabled ? disabledReasonText : undefined }
			/>
		</div>
	);
};

export default ListActionsBar;
