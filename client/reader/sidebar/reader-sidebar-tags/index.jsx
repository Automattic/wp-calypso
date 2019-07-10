/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import ReaderSidebarTagsList from './list';
import QueryReaderFollowedTags from 'components/data/query-reader-followed-tags';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { requestFollowTag } from 'state/reader/tags/items/actions';
import getReaderFollowedTags from 'state/selectors/get-reader-followed-tags';

export class ReaderSidebarTags extends Component {
	static propTypes = {
		tags: PropTypes.array,
		path: PropTypes.string.isRequired,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		currentTag: PropTypes.string,
		onFollowTag: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	followTag = tag => {
		if ( startsWith( tag, '#' ) ) {
			tag = tag.substring( 1 );
		}

		this.props.followTag( decodeURIComponent( tag ) );
		recordAction( 'followed_topic' );
		recordGaEvent( 'Clicked Follow Topic', tag );
		recordTrack( 'calypso_reader_reader_tag_followed', {
			tag: tag,
		} );
		this.props.onFollowTag( tag );
	};

	handleAddClick = () => {
		recordAction( 'follow_topic_open_input' );
		recordGaEvent( 'Clicked Add Topic to Open Input' );
		recordTrack( 'calypso_reader_add_tag_clicked' );
	};

	render() {
		const { tags, isOpen, translate, onClick } = this.props;
		return (
			<ul>
				{ ! tags && <QueryReaderFollowedTags /> }
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'Tags' ) }
					addLabel={ translate( 'New tag name' ) }
					addPlaceholder={ translate( 'Add any tag' ) }
					onAddSubmit={ this.followTag }
					onAddClick={ this.handleAddClick }
					onClick={ onClick }
					materialIcon="local_offer"
				>
					<ReaderSidebarTagsList { ...this.props } />
				</ExpandableSidebarMenu>
			</ul>
		);
	}
}

export default connect(
	state => ( {
		tags: getReaderFollowedTags( state ),
	} ),
	{
		followTag: requestFollowTag,
	}
)( localize( ReaderSidebarTags ) );
