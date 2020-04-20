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
import DisconnectSurvey from './disconnect-survey';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import NavigationLink from 'components/wizard/navigation-link';
import redirectNonJetpack from 'my-sites/site-settings/redirect-non-jetpack';
import Troubleshoot from './troubleshoot';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const DisconnectSite = ( { reason, siteSlug, translate } ) => {
	const confirmHref = '/settings/disconnect-site/confirm/' + siteSlug;

	let backHref = '/settings/manage-connection/' + siteSlug;
	if ( reason ) {
		backHref = '/settings/disconnect-site/' + siteSlug;
	}

	return (
		<div>
			<Main className="disconnect-site__site-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				<FormattedHeader
					headerText={ translate( 'Disable Jetpack' ) }
					subHeaderText={ translate( "Please let us know why you're disabling Jetpack." ) }
				/>
				<DisconnectSurvey confirmHref={ confirmHref } />
				<div className="disconnect-site__navigation-links">
					<NavigationLink href={ backHref } direction="back" />
					<NavigationLink href={ confirmHref } direction="forward" />
				</div>
				<Troubleshoot />
			</Main>
		</div>
	);
};

const connectComponent = connect( ( state ) => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) );

export default flowRight( connectComponent, localize, redirectNonJetpack() )( DisconnectSite );
