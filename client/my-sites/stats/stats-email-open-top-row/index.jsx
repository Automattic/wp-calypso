import { Gridicon } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import {
	getEmailStatsNormalizedData,
	isRequestingEmailStats,
} from 'calypso/state/stats/emails/selectors';
import { eye } from './icons';
import TopCard from './top-card';
import './style.scss';

export default function StatsEmailOpenTopRow( { siteId, postId, className } ) {
	const translate = useTranslate();

	const counts = useSelector( ( state ) =>
		getEmailStatsNormalizedData( state, siteId, postId, 'alltime', 'opens', null, 'rate' )
	);
	const isRequesting = useSelector( ( state ) =>
		isRequestingEmailStats( state, siteId, postId, 'alltime', 'opens' )
	);

	return (
		<div className={ classNames( 'stats-email-open-top-row', className ?? null ) }>
			<div className="highlight-cards-list">
				<TopCard
					heading={ translate( 'Recipients' ) }
					value={ counts?.total_sends }
					isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_sends' ) }
					icon={ <Gridicon icon="mail" /> }
				/>
				<TopCard
					heading={ translate( 'Total opens' ) }
					value={ counts?.total_opens }
					isLoading={ isRequesting && ! counts?.hasOwnProperty( 'total_opens' ) }
					icon={ <Icon icon={ eye } /> }
				/>
				<TopCard
					heading={ translate( 'Open rate' ) }
					value={ counts?.opens_rate ? `${ Math.round( counts?.opens_rate * 100 ) }%` : null }
					isLoading={ isRequesting && ! counts?.hasOwnProperty( 'opens_rate' ) }
					icon={ <Gridicon icon="trending" /> }
				/>
			</div>
		</div>
	);
}
