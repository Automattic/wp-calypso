/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import userFactory from 'lib/user';
import AuthorSelector from 'blocks/author-selector';
import PostActions from 'lib/posts/actions';
import touchDetect from 'lib/touch-detect';
import * as stats from 'lib/posts/stats';
import { getSelectedSite } from 'state/ui/selectors';
import PostEditStore from 'lib/posts/post-edit-store';

/**
 * Module dependencies
 */
const user = userFactory();

export class EditorAuthor extends Component {

	static propTypes = {
		post: React.PropTypes.object,
		isNew: React.PropTypes.bool
	};

	constructor( props ) {
		super( props );
		this.onChange = this.updatePostState.bind( this );
		this.state = { post: props.post };
	}

	componentWillMount() {
		// This is a hack since the author changes are stored in Flux.
		// See #13636 for more details. Remove once author changes are
		// migrated to Redux.
		PostEditStore.on( 'change', this.onChange );
	}

	componentWillUnmount() {
		PostEditStore.off( 'change', this.onChange );
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return this.state.post.author !== nextState.post.author;
	}

	updatePostState() {
		this.setState( {
			post: PostEditStore.get() || this.props.post
		} );
	}

	render() {
		// if it's not a new post and we are still loading
		// show a placeholder component
		const { translate, site } = this.props;
		const { post } = this.state;

		if ( ! post && ! this.props.isNew ) {
			return this.renderPlaceholder();
		}

		const author = ( post && post.author ) ? post.author : user.get();
		const name = author.display_name || author.name;
		const Wrapper = this.userCanAssignAuthor() ? AuthorSelector : 'div';
		const popoverPosition = touchDetect.hasTouch() ? 'bottom right' : 'bottom left';
		const wrapperProps = this.userCanAssignAuthor()
			? {
				siteId: site.ID,
				onSelect: this.onSelect,
				popoverPosition,
			}
			: {};

		return (
			<div className="editor-author">
				<Wrapper { ...wrapperProps }>
					<Gravatar size={ 26 } user={ author } />
					<span className="editor-author__name">
							{ translate( 'by %(name)s', { args: { name: name } } ) }
					</span>
				</Wrapper>
			</div>
		);
	}

	renderPlaceholder() {
		return (
			<div className="editor-author is-placeholder">
				<Gravatar size={ 26 } />
				<span className="editor-author__name" />
			</div>
		);
	}

	onSelect = ( author ) => {
		stats.recordStat( 'advanced_author_changed' );
		stats.recordEvent( 'Changed Author' );
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( { author: author } );
	};

	userCanAssignAuthor() {
		const { site } = this.props;
		const { post } = this.state;
		const reassignCapability = 'edit_others_' + post.type + 's';

		// if user cannot edit others posts
		if ( ! site || ! site.capabilities || ! site.capabilities[ reassignCapability ] ) {
			return false;
		}

		return true;
	}

}

export default connect(
	( state ) => ( {
		site: getSelectedSite( state )
	} )
)( localize( EditorAuthor ) );

