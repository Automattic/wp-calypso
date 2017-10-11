/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { flowRight, get } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import DisconnectSurvey from './disconnect-survey';
import MissingFeature from './missing-feature';
import TooDifficult from './too-difficult';
import TooExpensive from './too-expensive';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import NavigationLink from 'components/wizard/navigation-link';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import Main from 'components/main';
import Placeholder from 'my-sites/site-settings/placeholder';
import redirectNonJetpack from 'my-sites/site-settings/redirect-non-jetpack';

export const reasonComponents = {
	'missing-feature': MissingFeature,
	'too-difficult': TooDifficult,
	'too-expensive': TooExpensive,
};

const DisconnectSite = ( { reason, siteSlug, translate } ) => {
	if ( ! siteSlug ) {
		return <Placeholder />;
	}

	const ReasonComponent = get( reasonComponents, reason, DisconnectSurvey );

	let backHref = '/settings/manage-connection/' + siteSlug;
	if ( reason ) {
		backHref = '/settings/disconnect-site/' + siteSlug;
	}

	return (
		<div>
			<Main className="disconnect-site__site-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				<FormattedHeader
					headerText={ translate( 'Disconnect Site' ) }
					subHeaderText={ translate(
						"We'd love to know why you're disconnecting -- it will help us improve Jetpack."
					) }
				/>
				<ReasonComponent />
				<NavigationLink href={ backHref } direction="back" />
				<NavigationLink direction="forward" />
			</Main>
		</div>
	);
};

const connectComponent = connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) );

export default flowRight( connectComponent, localize, redirectNonJetpack() )( DisconnectSite );
