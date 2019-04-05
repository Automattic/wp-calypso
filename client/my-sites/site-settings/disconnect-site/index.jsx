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
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import MissingFeature from './missing-feature';
import NavigationLink from 'components/wizard/navigation-link';
import redirectNonJetpack from 'my-sites/site-settings/redirect-non-jetpack';
import TooDifficult from './too-difficult';
import TooExpensive from './too-expensive';
import Troubleshoot from './troubleshoot';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export const reasonComponents = {
	'missing-feature': MissingFeature,
	'too-difficult': TooDifficult,
	'too-expensive': TooExpensive,
};

const DisconnectSite = ( { reason, siteSlug, translate } ) => {
	const ReasonComponent = get( reasonComponents, reason, DisconnectSurvey );
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
					headerText={ translate( 'Disconnect Site' ) }
					subHeaderText={ translate(
						"We'd love to know why you're disconnecting — it will help us improve Jetpack."
					) }
				/>
				<ReasonComponent confirmHref={ confirmHref } />
				<div className="disconnect-site__navigation-links">
					<NavigationLink href={ backHref } direction="back" />
					<NavigationLink href={ confirmHref } direction="forward" />
				</div>
				<Troubleshoot />
			</Main>
		</div>
	);
};

const connectComponent = connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) );

export default flowRight(
	connectComponent,
	localize,
	redirectNonJetpack()
)( DisconnectSite );
