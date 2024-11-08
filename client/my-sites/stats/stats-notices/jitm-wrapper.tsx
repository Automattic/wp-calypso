import clsx from 'clsx';
import AsyncLoad from 'calypso/components/async-load';
import { useSelector } from 'calypso/state';
import { getTopJITM } from 'calypso/state/jitm/selectors';
import { StatsNoticeProps } from './types';

const JITMWrapper: React.FC< StatsNoticeProps > = ( { isOdysseyStats } ) => {
	const messagePath = isOdysseyStats
		? 'wp:jetpack_page_stats:admin_notices'
		: 'calypso:stats:admin_notices';
	const jitm = useSelector( ( state ) => getTopJITM( state, messagePath ) );
	return (
		<div
			className={ clsx( 'jetpack-jitm-message-container', {
				'inner-notice-container': !! jitm,
				'has-odyssey-stats-bg-color': isOdysseyStats,
				'inner-notice-container--calypso': ! isOdysseyStats,
			} ) }
		>
			<AsyncLoad
				require="calypso/blocks/jitm"
				placeholder={ null }
				messagePath={ messagePath }
				searchQuery="page%3Dstats"
			/>
		</div>
	);
};

export default JITMWrapper;
