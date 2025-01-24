import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { FullScreenLaunchpad } from './components/full-screen-launchpad';
import HomeContent from './components/home-content';

export default function CustomerHome( { showLaunchpadFirst = false } ) {
	const [ isShowingLaunchpad, setIsShowingLaunchpad ] = useState( showLaunchpadFirst );

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
