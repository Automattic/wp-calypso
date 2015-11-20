/**
 * External dependencies
 */
var React = require( 'react' ),
	isEqual = require( 'lodash/lang/isEqual' );

var StoreConnection = React.createClass( {
	propTypes: {
		component: React.PropTypes.func,
		getStateFromStores: React.PropTypes.func.isRequired,
		stores: React.PropTypes.array.isRequired
	},

	getInitialState: function() {
		return this.props.getStateFromStores( this.props );
	},

	componentDidMount: function() {
		this.addStoreListeners( this.props.stores );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! isEqual( this.props, nextProps ) ) {
			this.removeStoreListeners( this.props.stores );
			this.addStoreListeners( nextProps.stores );
			this.setState( nextProps.getStateFromStores( nextProps ) );
		}
	},

	componentWillUnmount: function() {
		this.removeStoreListeners( this.props.stores );
	},

	addStoreListeners: function( stores ) {
		stores.forEach( function( store ) {
			store.on( 'change', this.handleStoresChanged );
		}, this );
	},

	removeStoreListeners: function( stores ) {
		stores.forEach( function( store ) {
			store.off( 'change', this.handleStoresChanged );
		}, this );
	},

	handleStoresChanged: function() {
		this.setState( this.props.getStateFromStores( this.props ) );
	},

	render: function() {
		if ( this.props.component ) {
			return React.createElement( this.props.component, this.state );
		}

		const child = React.Children.only( this.props.children );
		return React.cloneElement( child, this.state );
	}
} );

module.exports = StoreConnection;
