/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import closest from 'component-closest';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal Dependencies
 */
import ExpandableSidebarMenu from '../expandable';
import ReaderSidebarTagsList from './list';
import QueryReaderFollowedTags from 'components/data/query-reader-followed-tags';
import { getReaderFollowedTags } from 'state/selectors';
import { requestFollowTag, requestUnfollowTag } from 'state/reader/tags/items/actions';

const stats = require( 'reader/stats' );

export class ReaderSidebarTags extends Component {

	static propTypes = {
		tags: PropTypes.array,
		path: PropTypes.string.isRequired,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		currentTag: PropTypes.string,
		onFollowTag: PropTypes.func,
		translate: PropTypes.func,
	}

	static defaultProps = {
		translate: identity,
	}

	followTag = ( tag ) => {
		this.props.followTag( tag );
		stats.recordAction( 'followed_topic' );
		stats.recordGaEvent( 'Clicked Follow Topic', tag );
		stats.recordTrack( 'calypso_reader_reader_tag_followed', {
			tag: tag
		} );
		this.props.onFollowTag( tag );
	}

	unfollowTag = ( event ) => {
		const node = closest( event.target, '[data-tag-slug]', true );
		event.preventDefault();
		const slug = node && node.dataset && node.dataset.tagSlug;
		if ( slug ) {
			stats.recordAction( 'unfollowed_topic' );
			stats.recordGaEvent( 'Clicked Unfollow Topic', slug );
			stats.recordTrack( 'calypso_reader_reader_tag_unfollowed', {
				tag: slug,
			} );
			this.props.unfollowTag( slug );
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
			<div>
				<QueryReaderFollowedTags />
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
			</div>
		);
	}
}

export default connect(
	state => ( {
		tags: getReaderFollowedTags( state ),
	} ),
	{
		followTag: requestFollowTag,
		unfollowTag: requestUnfollowTag,
	}
)( localize( ReaderSidebarTags ) );
