import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import Pagination from 'calypso/components/pagination';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { usePagination } from './hooks';
import { useSubscribersQuery } from './queries';

type SubscribersProps = {
	page: number;
	pageChanged: ( page: number ) => void;
};

const DEFAULT_PER_PAGE = 10;

export const Subscribers = ( { page, pageChanged }: SubscribersProps ) => {
	const isSubscribersPageEnabled = config.isEnabled( 'subscribers-page' );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const { data, isFetching } = useSubscribersQuery( selectedSiteId, page, 1 );
	const { pageClickCallback } = usePagination( page, pageChanged, isFetching );

	if ( ! isSubscribersPageEnabled ) {
		return null;
	}

	return (
		<Main>
			<DocumentHead title={ translate( 'Subscribers' ) } />
			Subscribers
			{ data?.subscribers.map( ( subscriber ) => (
				<div key={ subscriber.email_address }>{ subscriber.email_address }</div>
			) ) }
			<Pagination
				className="subscribers__pagination"
				page={ page }
				perPage={ data?.per_page ?? DEFAULT_PER_PAGE }
				total={ data?.total }
				pageClick={ pageClickCallback }
			/>
		</Main>
	);
};
