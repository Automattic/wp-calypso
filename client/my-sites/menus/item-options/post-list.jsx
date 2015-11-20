/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	debug = require( 'debug' )( 'calypso:menus:post-list' ),
	omit = require( 'lodash/object/omit' );

/**
 * Internal dependencies
 */
var	Posts = require( './posts' ),
	PostListFetcher = require( 'components/post-list-fetcher' );


/**
 * Component
 */
var PostList = React.createClass( {

	mixins: [ React.addons.PureRenderMixin ],

	getInitialState: function() {
		return {
			searchTerm: null
		};
	},

	onSearch: function( term ) {
		debug( 'onSearch ', term );
		this.setState( { searchTerm: term } );
	},

	render: function() {
		return (
			<PostListFetcher type={ this.props.type } siteID={ this.props.siteID } search={ this.state.searchTerm } status="publish,private" >
				<Posts
					{ ...omit( this.props, 'children' ) }
					onSearch={ this.onSearch }
				/>
			</PostListFetcher>
		);
	}
} );

module.exports = PostList;
