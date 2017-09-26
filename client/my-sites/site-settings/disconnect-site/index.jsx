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
import CenteredCard from 'my-sites/site-settings/centered-card';
import DocumentHead from 'components/data/document-head';
import { getSelectedSite } from 'state/ui/selectors';
import Main from 'components/main';
import Placeholder from 'my-sites/site-settings/placeholder';
import redirectNonJetpack from 'my-sites/site-settings/redirect-non-jetpack';
import SkipSurvey from './skip-survey';

class DisconnectSite extends Component {
	render() {
		const { site, translate } = this.props;

		if ( ! site ) {
			return <Placeholder />;
		}

		const header = translate( 'Disconnect Site' );
		const subheader = translate(
			'Tell us why you want to disconnect your site from WordPress.com.'
		);
		return (
			<Main className="disconnect-site site-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				<CenteredCard header={ header } subheader={ subheader }>
					{' '}
				</CenteredCard>
				<SkipSurvey />
			</Main>
		);
	}
}

const connectComponent = connect( state => {
	return {
		site: getSelectedSite( state ),
	};
} );

export default flowRight( connectComponent, localize, redirectNonJetpack() )( DisconnectSite );
