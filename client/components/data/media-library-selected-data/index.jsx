var PropTypes = require('prop-types');
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var MediaLibrarySelectedStore = require( 'lib/media/library-selected-store' ),
	passToChildren = require( 'lib/react-pass-to-children' );

function getStateData( siteId ) {
	return {
		mediaLibrarySelectedItems: MediaLibrarySelectedStore.getAll( siteId )
	};
}

module.exports = React.createClass( {
	displayName: 'MediaLibrarySelectedData',

	propTypes: {
		siteId: PropTypes.number.isRequired
	},

	getInitialState: function() {
		return getStateData( this.props.siteId );
	},

	componentDidMount: function() {
		MediaLibrarySelectedStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		MediaLibrarySelectedStore.off( 'change', this.updateState );
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
	}
} );
