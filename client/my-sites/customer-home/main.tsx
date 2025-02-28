import { ConfettiAnimation } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useShouldShowLaunchpadFirst } from 'calypso/state/selectors/should-show-launchpad-first';
import CelebrateLaunchModal from './components/celebrate-launch-modal';
import { FullScreenLaunchpad } from './components/full-screen-launchpad';
import HomeContent from './components/home-content';
import type { SiteDetails } from '@automattic/data-stores';

export default function CustomerHome( { site }: { site: SiteDetails } ) {
	const [ isLoadingShouldShowLaunchpadFirst, shouldShowLaunchpadFirst ] =
		useShouldShowLaunchpadFirst( site );

	const isSiteLaunched = site?.launch_status === 'launched' || false;

	const [ isFullLaunchpadDismissed, setIsFullLaunchpadDismissed ] = useState(
		site.options?.launchpad_screen === undefined ||
			site.options.launchpad_screen === 'skipped' ||
			isSiteLaunched
	);

	const translate = useTranslate();

	const [ showSiteLaunchedModal, setShowSiteLaunchedModal ] = useState( false );

	const { data: allDomains = [] } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	return (
		<Main wideLayout>
			<PageViewTracker path="/home/:site" title={ translate( 'My Home' ) } />
			<DocumentHead title={ translate( 'My Home' ) } />
			{ ! isLoadingShouldShowLaunchpadFirst && (
				<>
					{ shouldShowLaunchpadFirst && ! isFullLaunchpadDismissed ? (
						<FullScreenLaunchpad
							onClose={ () => setIsFullLaunchpadDismissed( true ) }
							onSiteLaunch={ () => {
								setIsFullLaunchpadDismissed( true );
								setShowSiteLaunchedModal( true );
							} }
						/>
					) : (
						<HomeContent />
					) }
					{ showSiteLaunchedModal && (
						<>
							<ConfettiAnimation />
							<CelebrateLaunchModal
								setModalIsOpen={ setShowSiteLaunchedModal }
								site={ site }
								allDomains={ allDomains }
							/>
						</>
					) }
				</>
			) }
		</Main>
	);
}
