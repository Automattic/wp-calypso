/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:components:data:tag-list' );

/**
 * Internal dependencies
 */
var TermActions = require( 'lib/terms/actions' ),
	passToChildren = require( 'lib/react-pass-to-children' ),
	TagStore = require( 'lib/terms/tag-store' );

function getStateData( siteId ) {
	return {
		tags: TagStore.all( siteId ),
		tagsHasNextPage: TagStore.hasNextPage( siteId ),
		tagsFetchingNextPage: TagStore.isFetchingPage( siteId )
	};
}

module.exports = React.createClass( {
	displayName: 'TagListData',

	propTypes: {
		siteId: React.PropTypes.number.isRequired
	},

	getInitialState: function() {
		return getStateData( this.props.siteId );
	},

	componentDidMount: function() {
		TagStore.on( 'change', this.updateState );
		this.maybeFetchData( this.props.siteId );
	},

	componentWillUnmount: function() {
		TagStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.siteId !== this.props.siteId ) {
			this.updateState( nextProps.siteId );
			this.maybeFetchData( nextProps.siteId );
		}
	},

	fetchData: function() {
		TermActions.fetchNextTagPage( this.props.siteId );
	},

	maybeFetchData: function( siteId ) {
		if ( TagStore.all( siteId ) ) {
			return;
		}

		setTimeout( function() {
			TermActions.fetchNextTagPage( siteId );
		}, 0 );
	},

	updateState: function( siteId ) {
		this.setState( getStateData( siteId || this.props.siteId ) );
	},

	render: function() {
		debug( 'rendering tag data for site ' + this.props.siteId, this.state );
		return passToChildren( this, this.state );
	}
} );
