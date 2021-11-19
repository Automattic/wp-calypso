import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';

const EditContactInfoPage = () => {
	return (
		<Main wideLayout>
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			Page goes here.
		</Main>
	);
};

EditContactInfoPage.propTypes = {
	domains: PropTypes.array.isRequired,
	selectedDomainName: PropTypes.string.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
};

export default connect( ( state, ownProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( localize( EditContactInfoPage ) );
