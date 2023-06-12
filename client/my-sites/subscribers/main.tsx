import config from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { Item } from 'calypso/components/breadcrumb';
import DocumentHead from 'calypso/components/data/document-head';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import Main from 'calypso/components/main';
import Pagination from 'calypso/components/pagination';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SubscriberList } from './components/subscriber-list/subscriber-list';
import { usePagination } from './hooks';
import { useSubscribersQuery } from './queries';
import './styles.scss';

type SubscribersProps = {
	page: number;
	pageChanged: ( page: number ) => void;
};

const DEFAULT_PER_PAGE = 10;

export const Subscribers = ( { page, pageChanged }: SubscribersProps ) => {
	const locale = useLocale();
	const isSubscribersPageEnabled = config.isEnabled( 'subscribers-page' );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const initialState = { data: { total: 0, subscribers: [], per_page: DEFAULT_PER_PAGE } };
	const result = useSubscribersQuery( selectedSiteId, page, DEFAULT_PER_PAGE );
	const {
		data: { total, subscribers = [], per_page },
	} = result && result.data ? result : initialState;
	const { isFetching } = result;
	const { pageClickCallback } = usePagination( page, pageChanged, isFetching );

	const navigationItems: Item[] = [
		{
			label: 'Subscribers',
			href: `/subscribers`,
			helpBubble: (
				<span>
					{ translate(
						'Add subscribers to your site and send them a free or paid {{link}}newsletter{{/link}}.',
						{
							components: {
								link: (
									<a
										href="https://wordpress.com/support/launch-a-newsletter/#about-your-subscribers"
										target="blank"
									/>
								),
							},
						}
					) }
				</span>
			),
		},
	];

	if ( ! isSubscribersPageEnabled || locale !== 'en' ) {
		return null;
	}

	return (
		<Main wideLayout className="subscribers">
			<DocumentHead title={ translate( 'Subscribers' ) } />
			<FixedNavigationHeader navigationItems={ navigationItems }></FixedNavigationHeader>
			<div className="subscribers__header-count">
				<span className="subscribers__title">{ translate( 'Total' ) }</span>{ ' ' }
				<span className="subscribers__subscriber-count">{ total }</span>
			</div>

			<SubscriberList subscribers={ subscribers } />

			<Pagination
				className="subscribers__pagination"
				page={ page }
				perPage={ per_page }
				total={ total }
				pageClick={ pageClickCallback }
			/>
		</Main>
	);
};
