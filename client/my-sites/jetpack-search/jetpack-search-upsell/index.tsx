import { PRODUCT_JETPACK_SEARCH } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import JetpackSearchFooter from '../footer';
import './style.scss';

export default function JetpackSearchUpsell(): ReactElement {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();
	const upgradeUrl =
		'https://jetpack.com/upgrade/search/?utm_campaign=my-sites-jetpack-search&utm_source=calypso&site=' +
		siteSlug;
	const item = slugToSelectorProduct( PRODUCT_JETPACK_SEARCH ) as SelectorProduct;

	return (
		<Main className="jetpack-search-upsell">
			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />

			<div className="jetpack-search-upsell__content">
				<JetpackProductCard
					buttonLabel={ translate( 'Upgrade to Jetpack Search' ) }
					buttonPrimary
					buttonURL={ upgradeUrl }
					description={ item.description }
					headerLevel={ 3 }
					hidePrice
					item={ item }
				/>
			</div>

			<JetpackSearchFooter />
		</Main>
	);
}
