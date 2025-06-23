import { video } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import EmptyModuleCard from 'calypso/my-sites/stats/components/empty-module-card';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsEmptyActionVideo from './stats-empty-action-video';

const EmptyModuleCardVideo = () => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const supportContext = isSiteJetpackNotAtomic ? 'stats-videos-jetpack' : 'stats-videos';

	return (
		<EmptyModuleCard
			icon={ video }
			description={ translate(
				'Your {{link}}most popular videos{{/link}} will display here to better understand how they performed. Start uploading!',
				{
					comment: '{{link}} links to support documentation.',
					components: {
						link: <InlineSupportLink supportContext={ supportContext } showIcon={ false } />,
					},
					context: 'Stats: Info box label when the Videos module is empty',
				}
			) }
			cards={ <StatsEmptyActionVideo from="module_videos" /> }
		/>
	);
};

export default EmptyModuleCardVideo;
