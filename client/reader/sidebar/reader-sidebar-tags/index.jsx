/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import closest from 'component-closest';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal Dependencies
 */
import ExpandableSidebarMenu from '../expandable';
import ReaderSidebarTagsList from './list';
import TagStore from 'lib/reader-tags/subscriptions';
import TagActions from 'lib/reader-tags/actions';

const stats = require( 'reader/stats' );

export class ReaderSidebarTags extends Component {

	static propTypes = {
		tags: PropTypes.array,
		path: PropTypes.string.isRequired,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		currentTag: PropTypes.string,
		onTagExists: PropTypes.func,
		translate: PropTypes.func,
	}

	static defaultProps = {
		translate: identity,
	}

	followTag = ( tag ) => {
		const subscription = TagStore.getSubscription( TagActions.slugify( tag ) );
		if ( subscription ) {
			this.props.onTagExists( subscription );
		} else {
			TagActions.follow( tag );
			stats.recordAction( 'followed_topic' );
			stats.recordGaEvent( 'Clicked Follow Topic', tag );
			stats.recordTrack( 'calypso_reader_reader_tag_followed', {
				tag: tag
			} );
		}
	}

	unfollowTag = ( event ) => {
		event.preventDefault();
		const node = closest( event.target, '[data-tag-slug]', true );
		const slug = node && node.dataset.tagSlug;
		if ( slug ) {
			stats.recordAction( 'unfollowed_topic' );
			stats.recordGaEvent( 'Clicked Unfollow Topic', slug );
			stats.recordTrack( 'calypso_reader_reader_tag_unfollowed', {
				tag: slug
			} );
			TagActions.unfollow( { slug } );
		}
	}

	handleAddClick = () => {
		stats.recordAction( 'follow_topic_open_input' );
		stats.recordGaEvent( 'Clicked Add Topic to Open Input' );
		stats.recordTrack( 'calypso_reader_add_tag_clicked' );
	}

	render() {
		const { tags, isOpen, translate, onClick } = this.props;
		const tagCount = tags ? tags.length : 0;
		return (
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Tags' ) }
				count={ tagCount }
				addLabel={ translate( 'New tag name' ) }
				addPlaceholder={ translate( 'Add any tag' ) }
				onAddSubmit={ this.followTag }
				onAddClick={ this.handleAddClick }
				onClick={ onClick }>
					<ReaderSidebarTagsList { ...this.props } onUnfollow={ this.unfollowTag } />
			</ExpandableSidebarMenu>
		);
	}
}



export default localize( ReaderSidebarTags );
