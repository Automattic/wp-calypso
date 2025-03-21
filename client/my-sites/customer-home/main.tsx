import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import HomeContent from './components/home-content';
import type { SiteDetails } from '@automattic/data-stores';

export default function CustomerHome( { site }: { site: SiteDetails } ) {
	const translate = useTranslate();

	return (
		<Main wideLayout>
			<PageViewTracker path="/home/:site" title={ translate( 'My Home' ) } />
			<DocumentHead title={ translate( 'My Home' ) } />
			{ site.options && <HomeContent /> }
		</Main>
	);
}
