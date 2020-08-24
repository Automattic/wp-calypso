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
		stores: PropTypes.array.isRequired,
	};

	state = this.props.getStateFromStores( this.props );

	componentDidMount() {
		this.addStoreListeners( this.props.stores );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const nextState = nextProps.getStateFromStores( nextProps );

		if ( ! isEqual( this.state, nextState ) ) {
			this.removeStoreListeners( this.props.stores );
			this.addStoreListeners( nextProps.stores );
			this.setState( nextState );
		}
	}

	componentWillUnmount() {
		this.removeStoreListeners( this.props.stores );
	}

	addStoreListeners = ( stores ) => {
		stores.forEach( function ( store ) {
			store.on( 'change', this.handleStoresChanged );
		}, this );
	};

	removeStoreListeners = ( stores ) => {
		stores.forEach( function ( store ) {
			store.off( 'change', this.handleStoresChanged );
		}, this );
	};

	handleStoresChanged = () => {
		this.setState( this.props.getStateFromStores( this.props ) );
	};

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
