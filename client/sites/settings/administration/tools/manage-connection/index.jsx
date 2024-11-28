import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import { Component } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import redirectNonJetpack from 'calypso/my-sites/site-settings/redirect-non-jetpack';
import DataSynchronization from './data-synchronization';
import DisconnectSiteLink from './disconnect-site-link';
import SiteOwnership from './site-ownership';

import './style.scss';

class ManageConnection extends Component {
	render() {
		const { redirect, translate } = this.props;

		return (
			<Panel className="settings-administration__manage-connection">
				<DocumentHead title={ translate( 'Site Settings' ) } />

				<HeaderCakeBack icon="chevron-left" onClick={ redirect } />
				<NavigationHeader
					title={ translate( 'Manage connection' ) }
					subtitle={ translate(
						'Sync your site content for a faster experience, change site owner, repair or terminate your connection.'
					) }
				/>

				<SiteOwnership />
				<DataSynchronization />
				<DisconnectSiteLink />
			</Panel>
		);
	}
}

export default flowRight( localize, redirectNonJetpack() )( ManageConnection );
