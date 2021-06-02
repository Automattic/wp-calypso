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
import JetpackSearchContent from './content';
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

			<JetpackSearchContent
				headerText={ translate( 'Finely-tuned search for your site.' ) }
				bodyText={ translate( 'Your visitors are getting our fastest search experience.' ) }
				buttonLink={ null }
				buttonText={ translate( 'Upgrade to Jetpack Search' ) }
				onClick={ null }
				iconComponent={ <JetpackSearchLogo /> }
			/>
		</Main>
	);
}
