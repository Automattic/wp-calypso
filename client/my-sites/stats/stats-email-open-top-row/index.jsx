import { Card, Gridicon, ShortenedNumber, Spinner } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getAlltimeStats } from 'calypso/state/stats/emails/selectors';
import { eye } from './icons';

import './style.scss';

/* This is a very stripped down version of HighlightCard
 * HighlightCard doens't support non-numeric values
 * */
const TopCard = ( { heading, icon, value } ) => {
	const isNumeric = Number.isFinite( value );
	const isLoading = ! value;
	return (
		<Card className="highlight-card">
			<div className="highlight-card-icon">{ icon }</div>
			<div className="highlight-card-heading">{ heading }</div>
			<div className="highlight-card-count">
				<span className="highlight-card-count-value" title={ isNumeric ? String( value ) : value }>
					{ isLoading && <Spinner /> }
					{ isNumeric ? <ShortenedNumber value={ value } /> : value }
				</span>
			</div>
		</Card>
	);
};

export default function StatsEmailOpenTopRow( { siteId, postId, className } ) {
	const translate = useTranslate();

	const counts = useSelector( ( state ) => getAlltimeStats( state, siteId, postId ) );
	return (
		<div className={ classNames( 'stats-email-open-top-row', className ?? null ) }>
			<div className="highlight-cards-list">
				<TopCard
					heading={ translate( 'Recipients' ) }
					value={ counts?.total_sends }
					icon={ <Gridicon icon="mail" /> }
				/>
				<TopCard
					heading={ translate( 'Total opens' ) }
					value={ counts?.total_opens }
					icon={ <Icon icon={ eye } /> }
				/>
				<TopCard
					heading={ translate( 'Open rate' ) }
					value={ counts?.opens_rate ? `${ Math.round( counts?.opens_rate * 100 ) }%` : null }
					icon={ <Gridicon icon="trending" /> }
				/>
			</div>
		</div>
	);
}
