import { useDispatch } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import StatsCardUpsellOverlay from './stats-card-upsell-overlay';
import getUpsellCopy from './stats-upsell-copy';
import { Props } from '.';

import './style.scss';

const StatsCardUpsell: React.FC< Props > = ( { className, statType, siteId, buttonLabel } ) => {
	const dispatch = useDispatch();

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		dispatch( toggleUpsellModal( siteId, statType ) );
	};

	return (
		<StatsCardUpsellOverlay
			className={ className }
			onClick={ onClick }
			copyText={ preventWidows( getUpsellCopy( statType ) ) }
			buttonLabel={ buttonLabel }
		/>
	);
};

export default StatsCardUpsell;
