import { Gridicon } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PERIOD_ALL_TIME } from 'calypso/state/stats/emails/constants';
import {
	getEmailStatsNormalizedData,
	isRequestingEmailStats,
} from 'calypso/state/stats/emails/selectors';
import { eye } from './icons';
import TopCard from './top-card';
import './style.scss';

export default function StatsEmailTopRow( { siteId, postId, statType, className } ) {
	const translate = useTranslate();

	const counts = useSelector( ( state ) =>
		getEmailStatsNormalizedData( state, siteId, postId, PERIOD_ALL_TIME, statType, '', 'rate' )
	);
	const isRequesting = useSelector( ( state ) =>
		isRequestingEmailStats( state, siteId, postId, PERIOD_ALL_TIME, statType )
	);

	const boxes = useMemo( () => {
		switch ( statType ) {
			case 'opens':
				return (
					<>
						<TopCard
							heading={ translate( 'Recipients' ) }
							value={ counts?.total_sends ?? 0 }
							isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_sends' ) }
							icon={ <Gridicon icon="mail" /> }
						/>
						<TopCard
							heading={ translate( 'Total opens' ) }
							value={ counts?.total_opens ?? 0 }
							isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_opens' ) }
							icon={ <Icon icon={ eye } /> }
						/>
						<TopCard
							heading={ translate( 'Open rate' ) }
							value={ counts?.opens_rate ? `${ Math.round( counts?.opens_rate * 100 ) }%` : null }
							isLoading={ isRequesting && ! counts?.hasOwnProperty( 'opens_rate' ) }
							icon={ <Gridicon icon="trending" /> }
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
					</>
				);
			default:
				return null;
		}
	}, [ statType, counts, translate, isRequesting ] );

	return (
		<div className={ classNames( 'stats-email-open-top-row', className ?? null ) }>
			<div className="highlight-cards-list">{ boxes }</div>
		</div>
	);
}
