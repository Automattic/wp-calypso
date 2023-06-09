import config from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { Item } from 'calypso/components/breadcrumb';
import DocumentHead from 'calypso/components/data/document-head';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import Main from 'calypso/components/main';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SubscriberList } from './components/subscriber-list/subscriber-list';
import { useSubscribersQuery } from './queries';
import './styles.scss';

export const Subscribers = () => {
	const isSubscribersPageEnabled = config.isEnabled( 'subscribers-page' );
	const locale = useLocale();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const initialState = { data: { total: 0, subscribers: [] } };
	const result = useSubscribersQuery( selectedSiteId );
	const {
		data: { total, subscribers = [] },
	} = result && result.data ? result : initialState;

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

	if ( ! isSubscribersPageEnabled ) {
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
			<SubscriberList subscribers={ subscribers } locale={ locale } />
		</Main>
	);
};
