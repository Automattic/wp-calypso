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
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import DisconnectReasonsMenu from './disconnect-reasons-menu';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import FormattedHeader from 'components/formatted-header';

class DisconnectSite extends Component {
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
			<Main className="disconnect-site why site-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				<FormattedHeader
								headerText="Disconnect Site"
								subHeaderText="Tell us why you want to disconnect your site from Wordpress.com."
							/>
				<DisconnectReasonsMenu />
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
		siteSlug: getSelectedSiteSlug( state ),
	} )
)( localize( DisconnectSite ) );
