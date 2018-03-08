/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import {
	getCustomerSearchResults,
	isCustomerSearchLoaded,
} from 'woocommerce/state/sites/customers/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { searchCustomers } from 'woocommerce/state/sites/customers/actions';

class CustomerList extends PureComponent {
	static propTypes = {
		isLoaded: PropTypes.bool.isRequired,
		customers: PropTypes.arrayOf(
			PropTypes.shape( {
				email: PropTypes.string.isRequired,
				billing: PropTypes.object.isRequired,
				shipping: PropTypes.object.isRequired,
			} )
		),
		onSelect: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		term: PropTypes.string,
	};

	componentWillMount() {
		this.fetchData( this.props );
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.siteId !== this.props.siteId || newProps.term !== this.props.term ) {
			this.fetchData( newProps );
		}
	}

	fetchData = ( { siteId, isLoaded, term } ) => {
		if ( ! siteId ) {
			return;
		}
		if ( ! isLoaded && term.length > 2 ) {
			this.props.searchCustomers( siteId, term );
		}
	};

	onSelect = term => event => {
		event.preventDefault();
		this.props.onSelect( term );
	};

	renderCustomer = customer => {
		const { translate } = this.props;
		return (
			<div className="customer-search__customer" key={ customer.id }>
				<Button compact onClick={ this.onSelect( customer ) }>
					{ translate( 'Select' ) }
				</Button>
				<div className="customer-search__customer-name">
					{ customer.first_name } { customer.last_name }
				</div>
				<div className="customer-search__customer-email">{ customer.email }</div>
				<div className="customer-search__customer-city">
					{ get( customer, 'billing.city', '' ) }, { get( customer, 'billing.state', '' ) }
				</div>
			</div>
		);
	};

	render() {
		const { customers } = this.props;

		return <div className="customer-search__list">{ customers.map( this.renderCustomer ) }</div>;
	}
}

export default connect(
	( state, { term } ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const customers = getCustomerSearchResults( state, term, siteId );
		const isLoaded = isCustomerSearchLoaded( state, term, siteId );

		return {
			customers,
			isLoaded,
			siteId,
		};
	},
	dispatch => bindActionCreators( { searchCustomers }, dispatch )
)( localize( CustomerList ) );
