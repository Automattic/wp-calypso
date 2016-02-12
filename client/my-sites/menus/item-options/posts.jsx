/**
 * External Dependenices
 */
var React = require( 'react' ),
	find = require( 'lodash/find' );
/**
 * Internal Dependencies
 */
var siteMenus = require( 'lib/menu-data' ),
	helpers = require( 'my-sites/pages/helpers' ),
	OptionList = require( './option-list' ),
	Options = require( './options' ),
	actions = require( 'lib/posts/actions' );


var Posts = React.createClass( {

	propTypes: {
		posts: React.PropTypes.array,
		loading: React.PropTypes.bool,
		itemType: React.PropTypes.object,
		back: React.PropTypes.func,
		onSearch: React.PropTypes.func,
		isLastPage: React.PropTypes.bool,
		item: React.PropTypes.object,
		onChange: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			posts: [],
			loading: true
		};
	},

	/**
	 * Returns the title of the front page set in the blog settings, if there's none,
	 * returns undefined.
	 * @returns {string|undefined}
	 */
	getHomePageTitle: function () {
		var site = this.props.site,
			homePagePost = find( this.props.posts, function ( post ) {
			return helpers.isFrontPage( post, site );
		} );
		return homePagePost && homePagePost.title;
	},

	/**
	 * Injects "Homepage" if the view type is page.
	 * @returns {Post[]}
	 */
	maybeInjectPosts: function () {
		var posts = this.props.posts.slice();
		if ( this.props.type === 'page' ) {
			posts.unshift( siteMenus.generateHomePageMenuItem( this.getHomePageTitle() ) );
		}
		return posts;
	},

	render: function() {
		return (
			<OptionList itemType={ this.props.itemType }
			            onScroll={ actions.fetchNextPage }
			            onBackClick={ this.props.back }
			            onSearch={ this.props.onSearch }
			            isEmpty={ this.props.posts.length === 0 && ! this.props.loading }
			            isLoading={ this.props.loading && ! this.props.isLastPage } >
				<Options item={ this.props.item }
				         itemType={ this.props.itemType }
				         options={ this.maybeInjectPosts( this.props.posts ) }
				         onChange={ this.props.onChange }
					/>
			</OptionList>
		);
	}

} );

module.exports = Posts;
