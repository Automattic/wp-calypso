/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const Gravatar = require( 'components/gravatar' ),
	user = require( 'lib/user' )(),
	AuthorSelector = require( 'blocks/author-selector' ),
	PostActions = require( 'lib/posts/actions' ),
	touchDetect = require( 'lib/touch-detect' ),
	sites = require( 'lib/sites-list' )(),
	stats = require( 'lib/posts/stats' );

export default React.createClass( {
	displayName: 'EditorAuthor',

	propTypes: {
		post: React.PropTypes.object,
		isNew: React.PropTypes.bool
	},

	render: function() {
		// if it's not a new post and we are still loading
		// show a placeholder component
		const post = this.props.post;

		if ( ! post && ! this.props.isNew ) {
			return this.renderPlaceholder();
		}

		const author = ( post && post.author ) ? post.author : user.get();
		const name = author.display_name || author.name;
		const Wrapper = this.userCanAssignAuthor() ? AuthorSelector : 'div';
		const popoverPosition = touchDetect.hasTouch() ? 'bottom right' : 'bottom left';

		return (
			<div className="editor-author">
				<Wrapper siteId={ this.props.post.site_ID } onSelect={ this.onSelect } popoverPosition={ popoverPosition }>
					<Gravatar size={ 26 } user={ author } />
					<span className="editor-author__name">
							{ this.translate( 'by %(name)s', { args: { name: name } } ) }
					</span>
				</Wrapper>
			</div>
		);
	},

	renderPlaceholder: function() {
		return (
			<div className="editor-author is-placeholder">
				<Gravatar size={ 26 } />
				<span className="editor-author__name" />
			</div>
		);
	},

	onSelect: function( author ) {
		stats.recordStat( 'advanced_author_changed' );
		stats.recordEvent( 'Changed Author' );
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( { author: author } );
	},

	userCanAssignAuthor: function() {
		var post = this.props.post,
			reassignCapability = 'edit_others_' + post.type + 's',
			site = sites.getSite( this.props.post.site_ID );

		// if user cannot edit others posts
		if ( ! site || ! site.capabilities || ! site.capabilities[ reassignCapability ] ) {
			return false;
		}

		return true;
	},

} );
