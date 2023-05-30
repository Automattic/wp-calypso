import { Spinner } from '@automattic/components';
import { SubscriptionManager } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { SiteList } from 'calypso/landing/subscriptions/components/site-list';
import './styles.scss';

const SiteSubscriptionsList = () => {
	const translate = useTranslate();
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery();
	const { subscriptions, totalCount } = data ?? {};

	if ( error ) {
		return (
			<Notice type={ NoticeType.Error }>
				{ translate( "Oops! The subscription couldn't be found or doesn't exist." ) }
			</Notice>
		);
	}

	if ( isLoading ) {
		return <Spinner />;
	}

	if ( ! totalCount ) {
		return (
			<Notice type={ NoticeType.Warning }>
				{ translate( 'You are not subscribed to any sites.' ) }
			</Notice>
		);
	}

	return (
		<div>
			<div className="subscriptions-manager__list-actions-bar">
				<SearchInput
					placeholder={ translate( 'Search by site name or address…' ) }
					searchIcon={ <SearchIcon size={ 18 } /> }
					onSearch={ () => undefined }
				/>
			</div>
			<SiteList sites={ subscriptions } />
		</div>
	);
};

export default SiteSubscriptionsList;
