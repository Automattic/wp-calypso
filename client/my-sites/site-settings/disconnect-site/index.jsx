import { isEnabled } from '@automattic/calypso-config';
import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import redirectNonJetpack from 'calypso/my-sites/site-settings/redirect-non-jetpack';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import DownFlow from './down-flow';
import SurveyFlow from './survey-flow';

import './style.scss';

const DisconnectSite = ( { backHref, reason, site, type } ) => {
	const confirmHref = `/settings/disconnect-site/confirm/${ site.slug }`;

	if ( reason ) {
		// If a reason is given then this is being rendered on the confirm screen,
		// so navigating back should always go to the disconnect-site screen.
		backHref = '/settings/disconnect-site/' + site.slug;
	} else {
		// If a reason wasn't given then navigating back should go to what was given as a prop,
		// or to /settings/manage-connection/:site by default.
		backHref =
			backHref ??
			( isEnabled( 'untangling/hosting-menu' )
				? '/sites/settings/administration/' + site.slug + '/manage-connection'
				: '/settings/manage-connection/' + site.slug );
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
