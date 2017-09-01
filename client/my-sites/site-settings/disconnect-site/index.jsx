/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
/**
 * Internal dependencies
 */
import Card from 'components/card';
import DisconnectSurvey from './disconnect-survey';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import PaginationFlow from './pagination-flow';
import redirectNonJetpackToGeneral from 'my-sites/site-settings/redirect-to-general';
import ReturnToPreviousPage from 'my-sites/site-settings/render-return-button/back';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class DisconnectSite extends Component {
	// when complete, the flow will start from /settings/manage-connection
	handleClickBack = () => {
		const { siteSlug } = this.props;

		page( '/settings/manage-connection/' + siteSlug );
	};

	render() {
		const { translate } = this.props;

		return (
			<Main className="disconnect-site site-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				<ReturnToPreviousPage onBackClick={ this.handleClickBack } { ...this.props } />
				<FormattedHeader
					headerText={ translate( 'Disconnect Site' ) }
					subHeaderText={ translate(
						'Tell us why you want to disconnect your site from Wordpress.com.'
					) }
				/>
				<Card className="disconnect-site__card">
					<DisconnectSurvey />
				</Card>
				<PaginationFlow />
			</Main>
		);
	}
}

const connectComponent = connect( state => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} );

export default flowRight( connectComponent, localize, redirectNonJetpackToGeneral )(
	DisconnectSite
);
