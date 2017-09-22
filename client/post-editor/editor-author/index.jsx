/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AuthorSelector from 'blocks/author-selector';
import Gravatar from 'components/gravatar';
import PostActions from 'lib/posts/actions';
import * as stats from 'lib/posts/stats';
import touchDetect from 'lib/touch-detect';
import userFactory from 'lib/user';
import { getSelectedSite } from 'state/ui/selectors';

/**
 * Module dependencies
 */
const user = userFactory();

export class EditorAuthor extends Component {

	static propTypes = {
		post: PropTypes.object,
		isNew: PropTypes.bool,
		postAuthor: PropTypes.object,
	};

	render() {
		// if it's not a new post and we are still loading
		// show a placeholder component
		const { post, translate, site, postAuthor } = this.props;

		if ( ! post && ! this.props.isNew ) {
			return this.renderPlaceholder();
		}

		const author = ( post && postAuthor ) ? postAuthor : user.get();
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
		const { post, site } = this.props;
		if ( ! post ) {
			return false;
		}
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

