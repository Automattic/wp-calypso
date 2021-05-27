/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import PromoCard from 'calypso/components/promo-section/promo-card';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import Upsell from 'calypso/components/jetpack/upsell';
import JetpackSearchLogo from './logo';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Asset dependencies
 */
import JetpackSearchSVG from 'calypso/assets/images/illustrations/jetpack-search.svg';

interface Props {
	siteId: number;
}

export default function JetpackSearchPlaceholder( { siteId }: Props ): ReactElement {
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	return (
		<Main className="jetpack-search__placeholder">
			<QuerySitePurchases siteId={ siteId } />
			<QuerySiteSettings siteId={ siteId } />
			{ isJetpack && <QueryJetpackModules siteId={ siteId } /> }

			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />

			<Upsell
				headerText={ translate( 'Finely-tuned search for your site.' ) }
				bodyText={ translate(
					'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content – right when they need it.'
				) }
				buttonLink={ null }
				buttonText={ translate( 'Upgrade to Jetpack Search' ) }
				className="jetpack_search__placeholder"
				onClick={ () => {} }
				iconComponent={ <JetpackSearchLogo /> }
			/>
		</Main>
	);
}
