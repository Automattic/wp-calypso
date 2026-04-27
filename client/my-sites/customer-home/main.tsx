import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import SiteSetupContent from './components/site-setup-content';
import type { SiteDetails } from '@automattic/data-stores';

export default function CustomerHome( { site }: { site: SiteDetails } ) {
	const translate = useTranslate();

	return (
		<Main>
			<PageViewTracker path="/home/:site" title={ translate( 'Site Setup' ) } />
			<DocumentHead title={ translate( 'Site Setup' ) } />
			{ site.options && <SiteSetupContent /> }
		</Main>
	);
}
