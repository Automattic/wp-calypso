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
import DisconnectSurvey from './disconnect-survey';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import { getSelectedSite } from 'state/ui/selectors';
import Main from 'components/main';
import Placeholder from 'my-sites/site-settings/placeholder';
import SkipSurvey from './skip-survey';
import redirectNonJetpackToGeneral from 'my-sites/site-settings/redirect-to-general';
import ReturnToPreviousPage from 'my-sites/site-settings/render-return-button/back';

class DisconnectSite extends Component {
	// when complete, the flow will start from /settings/manage-connection
	handleClickBack = () => {
		const { siteSlug } = this.props;

		page( '/settings/manage-connection/' + siteSlug );
	};

	render() {
		const { site, translate } = this.props;

		if ( ! site ) {
			return <Placeholder />;
		}
		return (
			<div>
				<span className="disconnect-site__back-button">
					<ReturnToPreviousPage onBackClick={ this.handleClickBack } { ...this.props } />
				</span>
				<Main className="disconnect-site__site-settings">
					<DocumentHead title={ translate( 'Site Settings' ) } />
					<FormattedHeader
						headerText={ translate( 'Disconnect Site' ) }
						subHeaderText={ translate(
							"We'd love to know why you're disconnecting -- it will help us improve Jetpack."
						) }
					/>
					<div className="disconnect-site__card">
						<DisconnectSurvey />
					</div>
					<SkipSurvey />
				</Main>
			</div>
		);
	}
}

const connectComponent = connect( state => ( {
	site: getSelectedSite( state ),
} ) );

export default flowRight( connectComponent, localize, redirectNonJetpackToGeneral )(
	DisconnectSite
);
