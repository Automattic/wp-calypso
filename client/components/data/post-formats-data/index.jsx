/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PostFormatsActions = require( 'lib/post-formats/actions' ),
	PostFormatsStore = require( 'lib/post-formats/store' );

function getStateData( siteId ) {
	return {
		postFormats: PostFormatsStore.get( siteId )
	};
}

module.exports = React.createClass( {
	displayName: 'PostFormatsData',

	propTypes: {
		siteId: React.PropTypes.number.isRequired
	},

	getInitialState: function() {
		return getStateData( this.props.siteId );
	},

	componentDidMount: function() {
		PostFormatsStore.on( 'change', this.updateState );
		this.maybeFetchData( this.props.siteId );
	},

	componentWillUnmount: function() {
		PostFormatsStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.updateState( nextProps.siteId );
			this.maybeFetchData( nextProps.siteId );
		}
	},

	maybeFetchData: function( siteId ) {
		if ( PostFormatsStore.get( siteId ) ) {
			return;
		}

		setTimeout( function() {
			PostFormatsActions.fetch( siteId );
		}, 0 );
	},

	updateState: function( siteId ) {
		this.setState( getStateData( siteId || this.props.siteId ) );
	},

	render: function() {
		return React.cloneElement( this.props.children, this.state );
	}
} );
