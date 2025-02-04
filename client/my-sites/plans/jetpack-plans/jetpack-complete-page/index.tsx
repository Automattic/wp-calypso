//TODO: Remove this eslnit exception when whole component/child components are finished.
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PLAN_JETPACK_COMPLETE } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import rnaImageComplete from 'calypso/assets/images/jetpack/rna-image-complete.png';
import rnaImageComplete2xRetina from 'calypso/assets/images/jetpack/rna-image-complete@2x.png';
import QueryIntroOffers from 'calypso/components/data/query-intro-offers';
import QueryJetpackSaleCoupon from 'calypso/components/data/query-jetpack-sale-coupon';
import QueryJetpackUserLicensesCounts from 'calypso/components/data/query-jetpack-user-licenses-counts';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import JetpackRnaDialogCard from 'calypso/components/jetpack/card/jetpack-rna-dialog-card';
import Main from 'calypso/components/main';
import { JPC_PATH_PLANS } from 'calypso/jetpack-connect/constants';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { QueryArgs } from '../types';
import CtaButtons from './components/cta-buttons';
import { ItemPrice } from './item-price';
import ItemsIncluded from './items-included';
import ProductHeader from './product-header';
import ShowLicenseActivationLinkIfAvailable from './show-license-activation-link-if-available';
import PricingPageLink from './view-all-products-link';

import './style.scss';

interface Props {
	urlQueryArgs?: QueryArgs;
	siteSlug?: string;
}

const JetpackCompletePage: React.FC< Props > = ( { urlQueryArgs, siteSlug } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const item = slugToSelectorProduct( PLAN_JETPACK_COMPLETE );

	useEffect( () => {
		if ( window.location.pathname.startsWith( JPC_PATH_PLANS ) ) {
			dispatch( successNotice( translate( 'Jetpack is successfully connected' ) ) );
		}

		dispatch(
			recordTracksEvent( 'calypso_jetpack_complete_page_open', {
				site_id: siteId,
			} )
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return (
		<>
			<QueryJetpackUserLicensesCounts />
			<QueryProductsList type="jetpack" />
			{ siteId && <QueryIntroOffers siteId={ siteId ?? 'none' } /> }
			{ siteId && <QuerySiteProducts siteId={ siteId } /> }
			<QueryJetpackSaleCoupon />

			<Main className="jetpack-complete-page__main" wideLayout>
				<ShowLicenseActivationLinkIfAvailable siteId={ siteId } />
				<JetpackRnaDialogCard
					cardImage={ rnaImageComplete }
					cardImage2xRetina={ rnaImageComplete2xRetina }
				>
					<ProductHeader item={ item } />
					<PricingPageLink siteSlug={ siteSlug || urlQueryArgs?.site } />
					<ItemsIncluded />
					<ItemPrice item={ item } siteId={ siteId } />

					<CtaButtons />
				</JetpackRnaDialogCard>
			</Main>
		</>
	);
};

export default JetpackCompletePage;
