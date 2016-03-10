/**
 * External dependencies
 */
const React = require( 'react' );
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
/**
 * Internal dependencies
 */
const Gravatar = require( 'components/gravatar' ),
	user = require( 'lib/user' )(),
	AuthorSelector = require( 'components/author-selector' ),
	PostActions = require( 'lib/posts/actions' ),
	touchDetect = require( 'lib/touch-detect' ),
	sites = require( 'lib/sites-list' )(),
	config = require( 'config' ),
	stats = require( 'lib/posts/stats' );
import { setAuthor } from 'state/ui/editor/post/actions';
import { getSelectedSiteId, getCurrentEditedPostId } from 'state/ui/selectors';

const EditorAuthor = React.createClass( {
	propTypes: {
		siteId: React.PropTypes.number,
		postId: React.PropTypes.number,
		setAuthor: React.PropTypes.func,
	},
	getDefaultProps: function() {
		return {
			siteId: null,
			postId: null,
			setAuthor: () => {}
		};
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
		this.props.setAuthor( this.props.siteId, this.props.postId, author );
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

export default connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
		postId: getCurrentEditedPostId( state )
	} ),
	dispatch => bindActionCreators( { setAuthor }, dispatch )
)( EditorAuthor );
