/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import JetpackSearchContent from './content';
import JetpackSearchLogo from './logo';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	siteId: number;
	isJetpack: boolean;
}

export default function JetpackSearchPlaceholder( { siteId, isJetpack }: Props ): ReactElement {
	const currentUserId = useSelector( getCurrentUserId );
	return (
		<Main className="jetpack-search__placeholder">
			<QueryUserPurchases userId={ currentUserId } />
			{ ! isJetpack && <QuerySiteSettings siteId={ siteId } /> }
			{ isJetpack && <QueryJetpackModules siteId={ siteId } /> }

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
