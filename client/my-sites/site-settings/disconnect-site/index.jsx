/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import NavigationBackButton from 'components/navigation-back-button';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import Main from 'components/main';
import Placeholder from 'my-sites/site-settings/placeholder';
import redirectNonJetpack from 'my-sites/site-settings/redirect-non-jetpack';
import SkipSurvey from './skip-survey';

const DisconnectSite = ( { siteSlug, translate } ) => {
	if ( ! siteSlug ) {
		return <Placeholder />;
	}

	return (
		<div>
			<span className="disconnect-site__back-button-container">
				<NavigationBackButton redirectRoute={ '/settings/manage-connection/' + siteSlug } />
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
};

const connectComponent = connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) );

export default flowRight( connectComponent, localize, redirectNonJetpack() )( DisconnectSite );
