/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, get } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import DisconnectSurvey from './disconnect-survey';
import TooExpensive from './too-expensive';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import { getSelectedSite } from 'state/ui/selectors';
import Main from 'components/main';
import Placeholder from 'my-sites/site-settings/placeholder';
import redirectNonJetpack from 'my-sites/site-settings/redirect-non-jetpack';
import NavigationBackButton from 'my-sites/site-settings/navigation-back-button';
import SkipSurvey from './skip-survey';

const reasonComponents = {
	'too-expensive': TooExpensive,
};

class DisconnectSite extends Component {
	getRoute() {
		const { siteSlug } = this.props;

		if ( siteSlug ) {
			return '/settings/manage-connection/' + siteSlug;
		}
	}

	render() {
		const { reason, site, translate } = this.props;

		const ReasonComponent = get( reasonComponents, reason, DisconnectSurvey );

		if ( ! site ) {
			return <Placeholder />;
		}
		return (
			<div>
				<span className="disconnect-site__back-button-container">
					<NavigationBackButton redirectRoute={ this.getRoute() } />
				</span>
				<Main className="disconnect-site__site-settings">
					<DocumentHead title={ translate( 'Site Settings' ) } />
					<FormattedHeader
						headerText={ translate( 'Disconnect Site' ) }
						subHeaderText={ translate(
							"We'd love to know why you're disconnecting -- it will help us improve Jetpack."
						) }
					/>
					<ReasonComponent />
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
