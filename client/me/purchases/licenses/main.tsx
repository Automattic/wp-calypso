import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import LicenseList from 'calypso/me/purchases/licenses/license-list';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import titles from 'calypso/me/purchases/titles';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';

const License: React.FunctionComponent = () => {
	const translate = useTranslate();

	return (
		<Main wideLayout className="licenses">
			<DocumentHead title={ titles.licenses } />
			<PageViewTracker path="/me/purchases/licenses" title="Me > Licenses" />
			<MeSidebarNavigation />
			<FormattedHeader
				brandFont
				headerText={ titles.sectionTitle }
				subHeaderText={ translate( 'Manage Licenses.' ) }
				align="left"
			/>
			<PurchasesNavigation section="licenses" />
			<LicenseList />
		</Main>
	);
};

export default License;
