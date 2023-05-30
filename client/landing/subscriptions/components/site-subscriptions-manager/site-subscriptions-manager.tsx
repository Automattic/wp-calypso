import { SubscriptionManager, Reader } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { SortControls, Option } from 'calypso/landing/subscriptions/components/sort-controls';
import { useSearch } from 'calypso/landing/subscriptions/hooks';
import SiteSubscriptionsList from './site-subscriptions-list';
import './styles.scss';

const SortBy = Reader.SiteSubscriptionsSortBy;

const getSortOptions = ( translate: ReturnType< typeof useTranslate > ): Option[] => [
	{ value: SortBy.LastUpdated, label: translate( 'Recently updated' ) },
	{ value: SortBy.DateSubscribed, label: translate( 'Recently subscribed' ) },
	{ value: SortBy.SiteName, label: translate( 'Site name' ) },
];

const useSortOptions = ( translate: ReturnType< typeof useTranslate > ): Option[] =>
	useMemo( () => getSortOptions( translate ), [ translate ] );

const SiteSubscriptionsManager = () => {
	const translate = useTranslate();
	const { searchTerm, handleSearch } = useSearch();
	const [ sortTerm, setSortTerm ] = useState( SortBy.DateSubscribed );
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery( {
		searchTerm,
		sortTerm,
	} );
	const { subscriptions, totalCount } = data ?? {};
	const sortOptions = useSortOptions( translate );

	if ( error ) {
		return (
			<Notice type={ NoticeType.Error }>
				{ translate(
					'Oops! We had a small hiccup with your subscriptions. Could you please try reloading? Thank you!'
				) }
			</Notice>
		);
	}

	if ( isLoading ) {
		return (
			<div className="loading-container">
				<Spinner />
			</div>
		);
	}

	if ( ! isLoading && ! totalCount ) {
		return (
			<Notice type={ NoticeType.Warning }>
				{ translate( 'You are not subscribed to any sites.' ) }
			</Notice>
		);
	}

	return (
		<div className="site-subscriptions-manager">
			<div className="list-actions-bar">
				<SearchInput
					placeholder={ translate( 'Search by site name or address…' ) }
					searchIcon={ <SearchIcon size={ 18 } /> }
					onSearch={ handleSearch }
				/>
				<SortControls options={ sortOptions } value={ sortTerm } onChange={ setSortTerm } />
			</div>

			<SiteSubscriptionsList sites={ subscriptions } />

			{ totalCount > 0 && subscriptions.length === 0 && (
				<Notice type={ NoticeType.Warning }>
					{ translate( 'Sorry, no sites match {{italic}}%s.{{/italic}}', {
						components: { italic: <i /> },
						args: searchTerm,
					} ) }
				</Notice>
			) }
		</div>
	);
};

export default SiteSubscriptionsManager;
