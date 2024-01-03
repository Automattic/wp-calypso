import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import {
	STATS_FEATURE_DATE_CONTROL,
	STAT_TYPE_CLICKS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_TOP_AUTHORS,
} from '../constants';

import './style.scss';

interface Props {
	className: string;
	statType: string;
	siteId: number;
}

const getUpsellCopy = ( statType: string ) => {
	switch ( statType ) {
		case STAT_TYPE_REFERRERS:
			return translate( 'Learn where your visitors come from and optimize your content strategy.' );
		case STAT_TYPE_CLICKS:
			return translate(
				'Learn what your visitors are clicking to discover popular topics and formats.'
			);
		case STAT_TYPE_SEARCH_TERMS:
			return translate(
				'Learn what your visitors are searching for to discover popular topics and formats.'
			);
		case STAT_TYPE_TOP_AUTHORS:
			return translate(
				'Finding your top authors reveals your audience’s favorite writing styles and perspectives.'
			);
		case STATS_FEATURE_DATE_CONTROL:
			return translate( 'Compare different time periods to analyze your site’s growth.' );
		default:
			return translate( 'Upgrade your plan to unlock advanced stats.' );
	}
};

const StatsCardUpsell: React.FC< Props > = ( { className, statType, siteId } ) => {
	const dispatch = useDispatch();

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		dispatch( toggleUpsellModal( siteId, statType ) );
	};

	return (
		<div className={ classNames( 'stats-card-upsell', className ) }>
			<div className="stats-card-upsell__content">
				<div className="stats-card-upsell__lock">
					<Gridicon icon="lock" />
				</div>
				<p className="stats-card-upsell__text">{ preventWidows( getUpsellCopy( statType ) ) }</p>
				<Button primary className="stats-card-upsell__button" onClick={ onClick }>
					Unlock
				</Button>
			</div>
		</div>
	);
};

export default StatsCardUpsell;
