/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DataSynchronization from './data-synchronization';
import DisconnectSiteLink from './disconnect-site-link';
import DocumentHead from 'client/components/data/document-head';
import HeaderCake from 'client/components/header-cake';
import Main from 'client/components/main';
import SiteOwnership from './site-ownership';
import redirectNonJetpack from 'client/my-sites/site-settings/redirect-non-jetpack';

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
