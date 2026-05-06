import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useFeatureValue } from 'calypso/lib/explat';
import HomeContent from './components/home-content';
import type { SiteDetails } from '@automattic/data-stores';

export default function CustomerHome( { site }: { site: SiteDetails } ) {
	const translate = useTranslate();
	const homeVariant = useFeatureValue( 'wpcom_explat_v2_demo_v1', 'control' );
	const homeTitle =
		homeVariant === 'treatment' ? translate( 'My Dashboard' ) : translate( 'My Home' );

	return (
		<Main wideLayout>
			<PageViewTracker path="/home/:site" title={ homeTitle } />
			<DocumentHead title={ homeTitle } />
			{ site.options && <HomeContent /> }
		</Main>
	);
}
