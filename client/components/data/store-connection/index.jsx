/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { isEqual } from 'lodash';

class StoreConnection extends React.Component {
	static propTypes = {
		component: PropTypes.elementType,
		getStateFromStores: PropTypes.func.isRequired,
		isDataLoading: PropTypes.func,
		loadingPlaceholder: PropTypes.func,
	};

	state = this.props.getStateFromStores( this.props );

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const nextState = nextProps.getStateFromStores( nextProps );

		if ( ! isEqual( this.state, nextState ) ) {
			this.setState( nextState );
		}
	}

	isDataLoading = () => {
		if ( ! this.props.loadingPlaceholder || ! this.props.isDataLoading ) {
			return false;
		}

		return this.props.isDataLoading( this.state );
	};

	render() {
		if ( this.isDataLoading() ) {
			return React.createElement( this.props.loadingPlaceholder, this.state );
		}

		if ( this.props.component ) {
			return React.createElement( this.props.component, this.state );
		}

		return React.Children.map( this.props.children, ( child ) => {
			return React.cloneElement( child, this.state );
		} );
	}
}

export default StoreConnection;
