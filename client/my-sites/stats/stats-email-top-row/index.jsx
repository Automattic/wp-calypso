import { Gridicon } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Icon, send, seen, link } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PERIOD_ALL_TIME } from 'calypso/state/stats/emails/constants';
import {
	getEmailStatsNormalizedData,
	isRequestingEmailStats,
} from 'calypso/state/stats/emails/selectors';
import TopCard from './top-card';
import './style.scss';

export default function StatsEmailTopRow( { siteId, postId, statType, className, post } ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const counts = useSelector( ( state ) =>
		getEmailStatsNormalizedData( state, siteId, postId, PERIOD_ALL_TIME, statType, '', 'rate' )
	);
	const isRequesting = useSelector( ( state ) =>
		isRequestingEmailStats( state, siteId, postId, PERIOD_ALL_TIME, statType )
	);

	/**
	 * Only show email stats if post was published more than 5 minutes ago.
	 */
	const now = moment();
	const emailIsSending = post?.date ? now.diff( moment( post?.date ), 'minutes' ) < 5 : false;

	const boxes = useMemo( () => {
		switch ( statType ) {
			case 'opens':
				return (
					<>
						<TopCard
							heading={
								hasEnTranslation( 'Total emails sent' )
									? translate( 'Total emails sent' )
									: translate( 'Recipients' )
							}
							value={ counts?.total_sends ?? 0 }
							isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_sends' ) }
							icon={ <Icon icon={ send } /> }
							emailIsSending={ emailIsSending }
						/>
						{ counts?.unique_opens ? (
							<TopCard
								heading={ translate( 'Unique opens' ) }
								value={ counts.unique_opens }
								isLoading={ isRequesting && ! counts?.hasOwnProperty( 'unique_opens' ) }
								icon={ <Icon icon={ seen } /> }
							/>
						) : null }
						<TopCard
							heading={ translate( 'Total opens' ) }
							value={ counts?.total_opens ?? 0 }
							isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_opens' ) }
							icon={ <Icon icon={ seen } /> }
						/>
						<TopCard
							heading={ translate( 'Open rate' ) }
							value={ counts?.opens_rate ? `${ Math.round( counts?.opens_rate * 100 ) }%` : null }
							isLoading={ isRequesting && ! counts?.hasOwnProperty( 'opens_rate' ) }
							icon={ <Gridicon icon="trending" /> }
							emailIsSending={ emailIsSending }
						/>
					</>
				);
			case 'clicks':
				return (
					<>
						<TopCard
							heading={ translate( 'Total opens' ) }
							value={ counts?.total_opens ?? 0 }
							isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_opens' ) }
							icon={ <Icon icon={ seen } /> }
						/>
						<TopCard
							heading={ translate( 'Total clicks' ) }
							value={ counts?.total_clicks ?? 0 }
							isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_clicks' ) }
							icon={ <Icon icon={ link } /> }
						/>
						<TopCard
							heading={ translate( 'Click rate' ) }
							value={ counts?.clicks_rate ? `${ Math.round( counts?.clicks_rate * 100 ) }%` : null }
							isLoading={ isRequesting && ! counts?.hasOwnProperty( 'clicks_rate' ) }
							icon={ <Icon icon={ link } /> }
						/>
					</>
				);
			default:
				return null;
		}
	}, [ statType, counts, translate, isRequesting, emailIsSending ] );

	return (
		<div className={ clsx( 'stats-email-open-top-row', className ?? null ) }>
			<div className="highlight-cards-list">{ boxes }</div>
		</div>
	);
}
