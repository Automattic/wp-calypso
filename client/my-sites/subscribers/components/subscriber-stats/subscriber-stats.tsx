import { Icon, chartBar, tip } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSubscriberStatsRate } from '../../hooks';
import { useSubscriberStatsQuery } from '../../queries';
import { SubscriberStatsCard } from '../subscriber-stats-card';
import { MailIcon, SelectIcon } from './icons';
import './style.scss';

type SubscriberStatsProps = {
	siteId: number;
	subscriptionId?: number;
	userId?: number;
	dateSubscribed?: Date;
};

const SubscriberStats = ( {
	siteId,
	subscriptionId,
	userId,
	dateSubscribed,
}: SubscriberStatsProps ) => {
	const translate = useTranslate();

	const { data: subscriberStats, isLoading } = useSubscriberStatsQuery(
		siteId,
		subscriptionId,
		userId
	);

	const openRate = useSubscriberStatsRate( subscriberStats, 'unique_opens' );
	const clickRate = useSubscriberStatsRate( subscriberStats, 'unique_clicks' );

	return (
		<div className="subscriber-stats">
			<div className="subscriber-stats__list highlight-cards-list">
				<SubscriberStatsCard
					heading={ translate( 'Emails sent' ) }
					isLoading={ isLoading }
					icon={ <Icon icon={ MailIcon } /> }
					value={ subscriberStats?.emails_sent }
				/>
				<SubscriberStatsCard
					heading={ translate( 'Open rate' ) }
					isLoading={ isLoading }
					icon={ <Icon icon={ chartBar } /> }
					value={ `${ openRate }%` }
				/>
				<SubscriberStatsCard
					heading={ translate( 'Click rate' ) }
					icon={ <Icon icon={ SelectIcon } /> }
					isLoading={ isLoading }
					value={ `${ clickRate }%` }
				/>
			</div>
			{ dateSubscribed && dateSubscribed < new Date( '2023-08-17' ) ? (
				<div className="subscriber-stats__tip">
					<Icon icon={ tip } size={ 16 } />
					{ translate( 'Data available since August 17th, 2023' ) }
				</div>
			) : null }
		</div>
	);
};

export default SubscriberStats;
