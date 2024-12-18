import { Icon, send, seen, link } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { PERIOD_ALL_TIME } from 'calypso/state/stats/emails/constants';
import {
	getEmailStatsNormalizedData,
	isRequestingEmailStats,
} from 'calypso/state/stats/emails/selectors';
import TopCard from './top-card';
import './style.scss';

export default function StatsEmailTopRow( { siteId, postId, className = null } ) {
	const translate = useTranslate();

	const openCounts = useSelector( ( state ) =>
		getEmailStatsNormalizedData( state, siteId, postId, PERIOD_ALL_TIME, 'opens', '', 'rate' )
	);
	const clickCounts = useSelector( ( state ) =>
		getEmailStatsNormalizedData( state, siteId, postId, PERIOD_ALL_TIME, 'clicks', '', 'rate' )
	);
	const isRequesting = useSelector( ( state ) =>
		isRequestingEmailStats( state, siteId, postId, PERIOD_ALL_TIME, '' )
	);

	return (
		<div className={ clsx( 'stats-email-open-top-row', className ) }>
			<div className="highlight-cards-list">
				<TopCard
					heading={ translate( 'Total emails sent' ) }
					value={ openCounts?.total_sends ?? 0 }
					isLoading={ isRequesting && ! openCounts?.hasOwnProperty( 'total_sends' ) }
					icon={ <Icon icon={ send } /> }
				/>
				<TopCard
					heading={ translate( 'Open rate' ) }
					value={
						openCounts?.opens_rate ? `${ Math.round( openCounts?.opens_rate * 100 ) }%` : null
					}
					tooltip={
						openCounts?.hasOwnProperty( 'unique_opens' )
							? `${ openCounts.unique_opens || 0 } opens`
							: ''
					}
					isLoading={ isRequesting && ! openCounts?.hasOwnProperty( 'opens_rate' ) }
					icon={ <Icon icon={ seen } /> }
				/>
				<TopCard
					heading={ translate( 'Clicked' ) }
					value={
						clickCounts?.clicks_rate ? `${ Math.round( clickCounts?.clicks_rate * 100 ) }%` : null
					}
					tooltip={
						clickCounts?.hasOwnProperty( 'total_clicks' )
							? `${ clickCounts.total_clicks || 0 } clicks`
							: ''
					}
					isLoading={
						isRequesting &&
						! clickCounts?.hasOwnProperty( 'clicks_rate' ) &&
						! clickCounts?.hasOwnProperty( 'total_clicks' )
					}
					icon={ <Icon icon={ link } /> }
				/>
			</div>
		</div>
	);
	/*
{ /*
{ counts?.unique_opens ? (
	<TopCard
		heading={ translate( 'Unique opens' ) }
		value={ counts.unique_opens }
		isLoading={ isRequesting && ! counts?.hasOwnProperty( 'unique_opens' ) }
		icon={ <Icon icon={ send } /> }
	/>
) : null }
<TopCard
	heading={ translate( 'Total opens' ) }
	value={ counts?.total_opens ?? 0 }
	isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_opens' ) }
	icon={ <Icon icon={ eye } /> }
/>
<TopCard
	heading={ translate( 'Total opens' ) }
	value={ counts?.total_opens ?? 0 }
	isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_opens' ) }
	icon={ <Gridicon icon="mail" /> }
/>
<TopCard
	heading={ translate( 'Total clicks' ) }
	value={ counts?.total_clicks ?? 0 }
	isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_clicks' ) }
	icon={ <Icon icon={ eye } /> }
/>
<TopCard
	heading={ translate( 'Click rate' ) }
	value={ counts?.clicks_rate ? `${ Math.round( counts?.clicks_rate * 100 ) }%` : null }
	isLoading={ isRequesting && ! counts?.hasOwnProperty( 'clicks_rate' ) }
	icon={ <Gridicon icon="trending" /> }
/>
*/
}
