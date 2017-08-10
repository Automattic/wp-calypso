/** @format */
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Interanl dependencies
 */
var MediaValidationStore = require( 'lib/media/validation-store' ),
	passToChildren = require( 'lib/react-pass-to-children' );

function getStateData( siteId ) {
	return {
		mediaValidationErrors: MediaValidationStore.getAllErrors( siteId ),
	};
}

module.exports = React.createClass( {
	displayName: 'MediaValidationData',

	propTypes: {
		siteId: React.PropTypes.number.isRequired,
	},

	getInitialState: function() {
		return getStateData( this.props.siteId );
	},

	componentDidMount: function() {
		MediaValidationStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		MediaValidationStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.setState( getStateData( nextProps.siteId ) );
		}
	},

	updateState: function() {
		this.setState( getStateData( this.props.siteId ) );
	},

	render: function() {
		return passToChildren( this, this.state );
	},
} );
