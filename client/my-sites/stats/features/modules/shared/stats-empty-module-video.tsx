import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { video } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import EmptyModuleCard from 'calypso/my-sites/stats/components/empty-module-card';
import {
	JETPACK_SUPPORT_VIDEOPRESS_URL_STATS,
	VIDEOS_SUPPORT_URL,
} from 'calypso/my-sites/stats/const';
import StatsEmptyActionVideo from './stats-empty-action-video';

const getSupportUrl = () => {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	return isOdysseyStats ? JETPACK_SUPPORT_VIDEOPRESS_URL_STATS : VIDEOS_SUPPORT_URL;
};

const EmptyModuleCardVideo = () => (
	<EmptyModuleCard
		icon={ video }
		description={ translate(
			'Your {{link}}most popular videos{{/link}} will display here to better understand how they performed. Start uploading!',
			{
				comment: '{{link}} links to support documentation.',
				components: {
					link: <a target="_blank" rel="noreferrer" href={ localizeUrl( getSupportUrl() ) } />,
				},
				context: 'Stats: Info box label when the Videos module is empty',
			}
		) }
		cards={ <StatsEmptyActionVideo from="module_videos" /> }
	/>
);

export default EmptyModuleCardVideo;
