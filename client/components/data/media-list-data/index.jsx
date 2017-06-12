/**
 * External dependencies
 */
var React = require( 'react' ),
	assign = require( 'lodash/assign' ),
	isEqual = require( 'lodash/isEqual' );

/**
 * Internal dependencies
 */
var MediaActions = require( 'lib/media/actions' ),
	MediaListStore = require( 'lib/media/list-store' ),
	passToChildren = require( 'lib/react-pass-to-children' ),
	utils = require( './utils' );

function getStateData( siteId ) {
	return {
		media: MediaListStore.getAll( siteId ),
		mediaHasNextPage: MediaListStore.hasNextPage( siteId ),
		mediaFetchingNextPage: MediaListStore.isFetchingNextPage( siteId )
	};
}

module.exports = React.createClass( {
	displayName: 'MediaListData',

	propTypes: {
		siteId: React.PropTypes.number.isRequired,
		source: React.PropTypes.string,
		filter: React.PropTypes.string,
		search: React.PropTypes.string
	},

	getInitialState: function() {
		return getStateData( this.props.siteId );
	},

	componentWillMount: function() {
		MediaActions.setQuery( this.props.siteId, this.getQuery() );
		MediaListStore.on( 'change', this.updateStateData );
		this.updateStateData();
	},

	componentWillUnmount: function() {
		MediaListStore.off( 'change', this.updateStateData );
	},

	componentWillReceiveProps: function( nextProps ) {
		var nextQuery = this.getQuery( nextProps );

		if ( this.props.siteId !== nextProps.siteId || ! isEqual( nextQuery, this.getQuery() ) ) {
			MediaActions.setQuery( nextProps.siteId, nextQuery );
			this.setState( getStateData( nextProps.siteId ) );
		}
	},

	getQuery: function( props ) {
		var query = {};

		props = props || this.props;

		if ( props.search ) {
			query.search = props.search;
		}

		if ( props.filter ) {
			query.mime_type = utils.getMimeBaseTypeFromFilter( props.filter );
		}

		return query;
	},

	fetchData: function() {
		MediaActions.fetchNextPage( this.props.siteId );
	},

	updateStateData: function() {
		this.setState( getStateData( this.props.siteId ) );
	},

	render: function() {
		return passToChildren( this, assign( {}, this.state, {
			mediaOnFetchNextPage: this.fetchData
		} ) );
	}
} );
