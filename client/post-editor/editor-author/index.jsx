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

/**
 * Module dependencies
 */
const user = userFactory();

export class EditorAuthor extends Component {

	static propTypes = {
		post: React.PropTypes.object,
		isNew: React.PropTypes.bool
	};

	render() {
		// if it's not a new post and we are still loading
		// show a placeholder component
		const { post, translate } = this.props;

		if ( ! post && ! this.props.isNew ) {
			return this.renderPlaceholder();
		}

		const author = ( post && post.author ) ? post.author : user.get();
		const name = author.display_name || author.name;
		const Wrapper = this.userCanAssignAuthor() ? AuthorSelector : 'div';
		const popoverPosition = touchDetect.hasTouch() ? 'bottom right' : 'bottom left';

		return (
			<div className="editor-author">
				<Wrapper siteId={ post.site_ID } onSelect={ this.onSelect } popoverPosition={ popoverPosition }>
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
		const { post, site } = this.props;
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

