/** @format */
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
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import PaginationFlow from './pagination-flow';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

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
					headerText={ translate( 'Disconnect Site' ) }
					subHeaderText={ translate(
						'Tell us why you want to disconnect your site from Wordpress.com.'
					) }
				/>
				<div className="disconnect-site__card">
					<Card> </Card>
				</div>
				<PaginationFlow />
			</Main>
		);
	}
}

export default connect( state => ( {
	siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( DisconnectSite ) );
