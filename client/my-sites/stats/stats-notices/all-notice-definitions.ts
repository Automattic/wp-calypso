import config from '@automattic/calypso-config';
import { Notices } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import DoYouLoveJetpackStatsNotice from './do-you-love-jetpack-stats-notice';
import { StatsNoticeProps } from './types';

type StatsNoticeType = {
	component: React.ComponentType< StatsNoticeProps >;
	noticeId: keyof Notices;
	isVisibleFunc: ( options: StatsNoticeProps ) => boolean;
	disabled: boolean;
};

/** Sorted by priority */
const ALL_STATS_NOTICES: StatsNoticeType[] = [
	{
		component: DoYouLoveJetpackStatsNotice,
		noticeId: 'do_you_love_jetpack_stats' as keyof Notices,
		isVisibleFunc: ( {
			isOdysseyStats,
			isWpcom,
			isVip,
			isP2,
			isOwnedByTeam51,
			hasPaidStats,
			isSiteJetpackNotAtomic,
		}: StatsNoticeProps ) => {
			// Gate notices for WPCOM sites behind a flag.
			const showUpgradeNoticeForWpcomSites =
				config.isEnabled( 'stats/paid-wpcom-stats' ) &&
				isWpcom &&
				! isVip &&
				! isP2 &&
				! isOwnedByTeam51;

			// Show the notice if the site is Jetpack or it is Odyssey Stats.
			const showUpgradeNoticeOnOdyssey = config.isEnabled( 'stats/paid-stats' ) && isOdysseyStats;

			const showUpgradeNoticeForJetpackNotAtomic =
				config.isEnabled( 'stats/paid-stats' ) && isSiteJetpackNotAtomic;

			return !! (
				( showUpgradeNoticeOnOdyssey ||
					showUpgradeNoticeForJetpackNotAtomic ||
					showUpgradeNoticeForWpcomSites ) &&
				// Show the notice if the site has not purchased the paid stats product.
				! hasPaidStats
			);
		},
		disabled: false,
	},
];

export default ALL_STATS_NOTICES;
