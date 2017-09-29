/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import { getSelectedSite } from 'state/ui/selectors';
import Main from 'components/main';
import Placeholder from 'my-sites/site-settings/placeholder';
import redirectNonJetpack from 'my-sites/site-settings/redirect-non-jetpack';
import ReturnPreviousPage from 'my-sites/site-settings/return-previous-page';
import SkipSurvey from './skip-survey';

class DisconnectSite extends Component {
	// the flow starts at /settings/manage-connection
	// so let this be the default redirect if no previous page is provided

	getRoute() {
		const { siteSlug } = this.props;

		if ( siteSlug ) {
			return '/settings/manage-connection/' + siteSlug;
		}
	}

	render() {
		const { site, translate } = this.props;

		if ( ! site ) {
			return <Placeholder />;
		}
		return (
			<div>
				<span className="disconnect-site__back-button">
					<ReturnPreviousPage redirectRoute={ this.getRoute() } { ...this.props } />
				</span>
				<Main className="disconnect-site__site-settings">
					<DocumentHead title={ translate( 'Site Settings' ) } />
					<FormattedHeader
						headerText={ translate( 'Disconnect Site' ) }
						subHeaderText={ translate(
							'Tell us why you want to disconnect your site from WordPress.com.'
						) }
					/>
					<Card className="disconnect-site__card"> </Card>
					<SkipSurvey />
				</Main>
			</div>
		);
	}
}

const connectComponent = connect( state => {
	return {
		site: getSelectedSite( state ),
	};
} );

export default flowRight( connectComponent, localize, redirectNonJetpack() )( DisconnectSite );
