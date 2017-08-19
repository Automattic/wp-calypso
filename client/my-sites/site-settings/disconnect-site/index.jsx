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
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import PaginationFlow from './pagination-flow';
import redirectNonJetpackToGeneral from 'my-sites/site-settings/redirect-to-general';

class DisconnectSite extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Main className="disconnect-site site-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				<FormattedHeader
					headerText={ translate( 'Disconnect Site' ) }
					subHeaderText={ translate(
						'Tell us why you want to disconnect your site from Wordpress.com.'
					) }
				/>
				<Card className="disconnect-site__card"> </Card>
				<PaginationFlow />
			</Main>
		);
	}
}

export default flowRight( localize, redirectNonJetpackToGeneral )( DisconnectSite );
