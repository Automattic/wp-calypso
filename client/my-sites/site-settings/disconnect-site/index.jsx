import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import redirectNonJetpack from 'calypso/my-sites/site-settings/redirect-non-jetpack';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import DownFlow from './down-flow';
import SurveyFlow from './survey-flow';

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
