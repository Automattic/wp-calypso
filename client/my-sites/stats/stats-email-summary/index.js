import './style.scss';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const StatsEmailSummary = () => {
	return <p>Email summary placeholder</p>;
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state, siteId ),
	};
} )( localize( StatsEmailSummary ) );
