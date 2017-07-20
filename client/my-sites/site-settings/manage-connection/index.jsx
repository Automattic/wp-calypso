/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import DataSynchronization from './data-synchronization';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SiteOwnership from './site-ownership';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

class ManageConnection extends Component {
	componentDidMount() {
		this.verifySiteIsJetpack();
	}

	componentDidUpdate() {
		this.verifySiteIsJetpack();
	}

	verifySiteIsJetpack() {
		if ( this.props.siteIsJetpack === false ) {
			this.redirectToGeneral();
		}
	}

	redirectToGeneral = () => {
		const { siteSlug } = this.props;

		page( '/settings/general/' + siteSlug );
	};

	render() {
		const { translate } = this.props;

		return (
			<Main className="manage-connection site-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />

				<HeaderCake onClick={ this.redirectToGeneral }>
					{ translate( 'Manage Connection' ) }
				</HeaderCake>

				<SiteOwnership />
				<DataSynchronization />
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
		siteSlug: getSelectedSiteSlug( state ),
	} )
)( localize( ManageConnection ) );
