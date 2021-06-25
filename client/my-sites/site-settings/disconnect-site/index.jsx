/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import DownFlow from './down-flow';
import redirectNonJetpack from 'calypso/my-sites/site-settings/redirect-non-jetpack';
import SurveyFlow from './survey-flow';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const DisconnectSite = ( { reason, type, site } ) => {
	const confirmHref = `/settings/disconnect-site/confirm/${ site.slug }`;

	let backHref = '/settings/manage-connection/' + site.slug;
	if ( reason ) {
		backHref = '/settings/disconnect-site/' + site.slug;
	}

	if ( type === 'down' ) {
		return <DownFlow confirmHref={ confirmHref } backHref={ backHref } site={ site } />;
	}

	return <SurveyFlow confirmHref={ confirmHref } backHref={ backHref } />;
};

const connectComponent = connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) );

export default flowRight( connectComponent, redirectNonJetpack() )( DisconnectSite );
