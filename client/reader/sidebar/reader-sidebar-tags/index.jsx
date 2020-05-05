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
import FormTextInputWithAction from 'components/forms/form-text-input-with-action';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { requestFollowTag } from 'state/reader/tags/items/actions';
import { getReaderFollowedTags } from 'state/reader/tags/selectors';

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

	state = {
		addTagCounter: 0,
	};

	followTag = ( tag ) => {
		if ( startsWith( tag, '#' ) ) {
			tag = tag.substring( 1 );
		}

		this.props.followTag( decodeURIComponent( tag ) );
		recordAction( 'followed_topic' );
		recordGaEvent( 'Clicked Follow Topic', tag );
		recordTrack( 'calypso_reader_reader_tag_followed', { tag } );
		this.props.onFollowTag( tag );

		// reset the FormTextInputWithAction field to empty by rerendering it with a new `key`
		this.setState( ( state ) => ( { addTagCounter: state.addTagCounter + 1 } ) );
	};

	render() {
		const { tags, isOpen, translate, onClick } = this.props;
		return (
			<ul>
				{ ! tags && <QueryReaderFollowedTags /> }
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'Tags' ) }
					onClick={ onClick }
					materialIcon="local_offer"
				>
					<ReaderSidebarTagsList { ...this.props } />

					<FormTextInputWithAction
						key={ this.state.addTagCounter }
						action={ translate( 'Add' ) }
						placeholder={ translate( 'Add a tag' ) }
						onAction={ this.followTag }
					/>
				</ExpandableSidebarMenu>
			</ul>
		);
	}
}

export default connect(
	( state ) => ( {
		tags: getReaderFollowedTags( state ),
	} ),
	{
		followTag: requestFollowTag,
	}
)( localize( ReaderSidebarTags ) );
