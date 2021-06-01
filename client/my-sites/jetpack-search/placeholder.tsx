/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Upsell from 'calypso/components/jetpack/upsell';
import JetpackSearchLogo from './logo';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	siteId: number;
}

export default function JetpackSearchPlaceholder( { siteId }: Props ): ReactElement {
	return (
		<Main className="jetpack-search__placeholder">
			<QuerySitePurchases siteId={ siteId } />
			<DocumentHead title="Jetpack Search" />
			<SidebarNavigation />

			<Upsell
				headerText={ translate( 'Finely-tuned search for your site.' ) }
				bodyText={ translate(
					'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content – right when they need it.'
				) }
				buttonLink={ null }
				buttonText={ translate( 'Upgrade to Jetpack Search' ) }
				className="jetpack-search__placeholder"
				onClick={ null }
				iconComponent={ <JetpackSearchLogo /> }
			/>
		</Main>
	);
}
