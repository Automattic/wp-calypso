/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CustomerList from './list';
import FormLabel from 'components/forms/form-label';
import Search from 'components/search';

class CustomerSearch extends Component {
	static propTypes = {
		onSelect: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		value: PropTypes.string,
	};

	constructor( props ) {
		super( props );
		this.state = {
			term: props.value || '',
		};
	}

	doSearch = term => {
		this.setState( { term } );
	};

	render() {
		const { onSelect, translate } = this.props;
		const { term } = this.state;

		return (
			<div className="customer-search">
				<FormLabel>{ translate( 'Look up an existing customer by email' ) }</FormLabel>
				<Search onSearch={ this.doSearch } value={ term } />
				<CustomerList term={ term } onSelect={ onSelect } />
			</div>
		);
	}
}

export default localize( CustomerSearch );
