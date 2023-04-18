import config from '@automattic/calypso-config';
import { SubscriptionManager } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice } from 'calypso/landing/subscriptions/components/notice';
import { SiteList } from 'calypso/landing/subscriptions/components/site-list';
import { useSearch } from 'calypso/landing/subscriptions/hooks';
import TabView from '../tab-view';

const isSearchEnabled = config.isEnabled( 'subscription-management/sites-search' );

const Sites = () => {
	const translate = useTranslate();
	const { searchTerm, handleSearch } = useSearch();
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery( {
		searchTerm,
	} );
	const { subscriptions, totalCount } = data ?? {};
	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscriptions.' : '';

	if ( ! isLoading && ! totalCount ) {
		return <Notice type="warning">{ translate( 'You are not subscribed to any sites.' ) }</Notice>;
	}

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isLoading }>
			{ isSearchEnabled && (
				<div className="subscriptions-manager__list-actions-bar">
					<SearchInput
						placeholder={ translate( 'Search by site name or address…' ) }
						searchIcon={ <SearchIcon size={ 18 } /> }
						onSearch={ handleSearch }
					/>
				</div>
			) }

			<SiteList sites={ subscriptions } />

			{ totalCount && subscriptions.length === 0 && (
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
