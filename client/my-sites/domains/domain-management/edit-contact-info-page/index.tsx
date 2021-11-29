import { connect } from 'react-redux';
import TwoColumnsLayout from 'calypso/components/domains/layout/two-columns-layout';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';

const EditContactInfoPage = (): JSX.Element => {
	return (
		<Main className="edit-contact-info-page" wideLayout>
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			<TwoColumnsLayout content={ <div>CONTENT HERE</div> } sidebar={ <div>SIDEBAR HERE</div> } />
		</Main>
	);
};

export default connect( ( state, ownProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( EditContactInfoPage );
