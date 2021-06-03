/**
 * External dependencies
 */
import React, { ReactElement } from 'react';

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
				headerText={ 'Placeholder header' }
				bodyText={ 'Placeholder body text' }
				buttonText={ 'Button text' }
				iconComponent={ <JetpackSearchLogo /> }
			/>
		</Main>
	);
}
