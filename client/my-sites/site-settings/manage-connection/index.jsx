import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import { Component } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import redirectNonJetpack from 'calypso/my-sites/site-settings/redirect-non-jetpack';
import DataSynchronization from './data-synchronization';
import DisconnectSiteLink from './disconnect-site-link';
import SiteOwnership from './site-ownership';

import './style.scss';

class ManageConnection extends Component {
	render() {
		const { redirect, translate } = this.props;

		return (
			<Main className="manage-connection site-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />

				<HeaderCake onClick={ redirect }>{ translate( 'Manage Connection' ) }</HeaderCake>

				<SiteOwnership />
				<DataSynchronization />
				<DisconnectSiteLink />
			</Main>
		);
	}
}

export default flowRight( localize, redirectNonJetpack() )( ManageConnection );
