/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import DomainContactDetails from 'calypso/my-sites/checkout/composite-checkout/components/domain-contact-details';

class BulkEditContactInfo extends React.Component {
	static propTypes = {
		// domains: PropTypes.array.isRequired,
		// selectedDomainName: PropTypes.string.isRequired,
		// selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			contactDetails: {},
		};
	}

	updateDomainContactFields = ( data ) => {
		const newContactDetails = merge( {}, this.state.contactDetails, data );
		this.setState( { contactDetails: newContactDetails } );
	};

	render() {
		// if ( this.isDataLoading() ) {
		// 	return <DomainMainPlaceholder goBack={ this.goToContactsPrivacy } />;
		// }

		const domainNames = [ 'foo.com', 'bar.com', 'baz.co.uk' ];
		const contactDetailsErrors = {};

		return (
			<Main className="bulk-edit-contact-info">
				<Header
					// onClick={ this.goToContactsPrivacy }
					// // selectedDomainName={ this.props.selectedDomainName }
					isManagingAllDomains={ true }
				>
					{ this.props.translate( 'Edit Contact Info For All Domains' ) }
				</Header>
				<DomainContactDetails
					domainNames={ domainNames }
					contactDetails={ this.state.contactDetails }
					contactDetailsErrors={ contactDetailsErrors }
					updateDomainContactFields={ this.updateDomainContactFields }
					shouldShowContactDetailsValidationErrors={ false }
					isDisabled={ false }
					isLoggedOutCart={ false }
				/>
			</Main>
		);
	}

	// isDataLoading = () => {
	// 	return ! getSelectedDomain( this.props ) || this.props.isRequestingWhois;
	// };
}

export default connect( ( state, ownProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( localize( BulkEditContactInfo ) );
