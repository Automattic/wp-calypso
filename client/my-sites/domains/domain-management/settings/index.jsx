import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';

const Settings = () => {
	return <Main>Page goes here.</Main>;
};

export default connect( ( state, ownProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		hasDomainOnlySite: isDomainOnlySite( state, ownProps.selectedSite.ID ),
	};
} )( localize( Settings ) );
