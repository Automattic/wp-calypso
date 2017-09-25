/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { isEqual } from 'lodash';

const StoreConnection = React.createClass( {
	propTypes: {
		component: PropTypes.func,
		getStateFromStores: PropTypes.func.isRequired,
		isDataLoading: PropTypes.func,
		loadingPlaceholder: PropTypes.func,
		stores: PropTypes.array.isRequired
	},

	getInitialState() {
		return this.props.getStateFromStores( this.props );
	},

	componentDidMount() {
		this.addStoreListeners( this.props.stores );
	},

	componentWillReceiveProps( nextProps ) {
		if ( ! isEqual( this.props, nextProps ) ) {
			this.removeStoreListeners( this.props.stores );
			this.addStoreListeners( nextProps.stores );
			this.setState( nextProps.getStateFromStores( nextProps ) );
		}
	},

	componentWillUnmount() {
		this.removeStoreListeners( this.props.stores );
	},

	addStoreListeners( stores ) {
		stores.forEach( function( store ) {
			store.on( 'change', this.handleStoresChanged );
		}, this );
	},

	removeStoreListeners( stores ) {
		stores.forEach( function( store ) {
			store.off( 'change', this.handleStoresChanged );
		}, this );
	},

	handleStoresChanged() {
		this.setState( this.props.getStateFromStores( this.props ) );
	},

	isDataLoading() {
		if ( ! this.props.loadingPlaceholder || ! this.props.isDataLoading ) {
			return false;
		}

		return this.props.isDataLoading( this.state );
	},

	render() {
		if ( this.isDataLoading() ) {
			return React.createElement( this.props.loadingPlaceholder, this.state );
		}

		if ( this.props.component ) {
			return React.createElement( this.props.component, this.state );
		}

		const child = React.Children.only( this.props.children );

		return React.cloneElement( child, this.state );
	}
} );

export default StoreConnection;
