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
import Main from 'components/main';
import Placeholder from 'my-sites/site-settings/placeholder';
import redirectNonJetpack from 'my-sites/site-settings/redirect-non-jetpack';
import { getSelectedSiteId } from 'state/ui/selectors';

const ConfirmDisconnection = ( { siteId, translate } ) => {
	if ( ! siteId ) {
		return <Placeholder />;
	}

	return (
		<Main className="confirm-disconnection site-settings">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<FormattedHeader
				headerText={ translate( 'Confirm Disconnection' ) }
				subHeaderText={ translate(
					'Confirm that you want to disconnect your site from WordPress.com.'
				) }
			/>
			<Card className="confirm-disconnection__card" />
		</Main>
	);
};

const connectComponent = connect( state => ( {
	siteId: getSelectedSiteId( state ),
} ) );

export default flowRight( connectComponent, localize, redirectNonJetpack() )(
	ConfirmDisconnection
);
