import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import shouldShowLaunchpadFirst from 'calypso/state/selectors/should-show-launchpad-first';
import { FullScreenLaunchpad } from './components/full-screen-launchpad';
import HomeContent from './components/home-content';
import type { SiteDetails } from '@automattic/data-stores';

export default function CustomerHome( { site }: { site: SiteDetails } ) {
	const showLaunchpadFirst = shouldShowLaunchpadFirst( site );

	const isSiteLaunched = site?.launch_status === 'launched' || false;

	const [ isShowingLaunchpad, setIsShowingLaunchpad ] = useState(
		showLaunchpadFirst &&
			site.options?.launchpad_screen !== undefined &&
			site.options?.launchpad_screen !== 'skipped' &&
			! isSiteLaunched
	);

	const translate = useTranslate();

	return (
		<Main wideLayout>
			<PageViewTracker path="/home/:site" title={ translate( 'My Home' ) } />
			<DocumentHead title={ translate( 'My Home' ) } />
			{ isShowingLaunchpad ? (
				<FullScreenLaunchpad onClose={ () => setIsShowingLaunchpad( false ) } />
			) : (
				<HomeContent />
			) }
		</Main>
	);
}
