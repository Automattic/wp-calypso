import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import WebPreviewContent from './content';

const mapState = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isPrivateAtomic: isSiteAutomatedTransfer( state, siteId ) && isPrivateSite( state, siteId ),
		url: getSelectedSite( state )?.URL,
	};
};

export default connect( mapState, { recordTracksEvent } )( localize( WebPreviewContent ) );
