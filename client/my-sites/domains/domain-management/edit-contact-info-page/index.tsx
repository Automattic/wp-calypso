import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';
import type { EditContactInfoPageProps } from './types';

const EditContactInfoPage = ( props: EditContactInfoPageProps ): JSX.Element => {
	return (
		<Main className="edit-contact-info-page" wideLayout>
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			Page goes here.
		</Main>
	);
};

export default connect( ( state, ownProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( EditContactInfoPage );
