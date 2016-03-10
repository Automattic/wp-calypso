/**
 * External dependencies
 */
import React from 'react';
import unescapeString from 'lodash/unescape';
import _debug from 'debug';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import TokenField from 'components/token-field';
import TermsConstants from 'lib/terms/constants';
import PostActions from 'lib/posts/actions';
import { recordStat, recordEvent } from 'lib/posts/stats';
import { isPage } from 'lib/posts/utils';
import InfoPopover from 'components/info-popover';
import { setTags } from 'state/ui/editor/post/actions';

const debug = _debug( 'calypso:post-editor:editor-tags' );

const EditorTags = React.createClass( {
	displayName: 'EditorTags',

	propTypes: {
		siteId: React.PropTypes.number,
		postId: React.PropTypes.number,
		setTags: React.PropTypes.func,
		post: React.PropTypes.object,
		site: React.PropTypes.object,
		tags: React.PropTypes.arrayOf( React.PropTypes.object ),
		tagsHasNextPage: React.PropTypes.bool,
		tagsFetchingNextPage: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			post: {},
			site: {},
			setTags: () => {},
		};
	},

	onTagsChange: function( selectedTags ) {
		var tagStat, tagEventLabel;

		debug( 'onTagsChange', selectedTags );

		if ( selectedTags.length > this.getPostTags().length ) {
			tagStat = 'tag_added';
			tagEventLabel = 'Added Tag';
		} else {
			tagStat = 'tag_removed';
			tagEventLabel = 'Removed Tag';
		}

		recordStat( tagStat );
		recordEvent( 'Changed Tags', tagEventLabel );

		selectedTags = selectedTags.length ? selectedTags : null;
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			tags: selectedTags
		} );

		this.props.setTags( this.props.site.ID, this.props.post.ID, selectedTags );
	},

	getPostTags: function() {
		if ( ! this.props.post || ! this.props.post.tags ) {
			return [];
		}

		if ( Array.isArray( this.props.post.tags ) ) {
			return this.props.post.tags;
		}

		return Object.keys( this.props.post.tags );
	},

	render: function() {
		var tagNames = ( this.props.tags || [] ).map( function( tag ) {
			return tag.name;
		} );

		return (
			<label className="editor-drawer__label">
				<span className="editor-drawer__label-text">
					{ this.translate( 'Tags' ) }
					<InfoPopover position="top left">
						{ isPage( this.props.post )
							? this.translate( 'Use tags to associate more specific keywords with your pages.' )
							: this.translate( 'Use tags to associate more specific keywords with your posts.' ) }
					</InfoPopover>
				</span>
				<TokenField
					value={ this.getPostTags() }
					displayTransform={ unescapeString }
					suggestions={ tagNames }
					onChange={ this.onTagsChange }
					maxSuggestions={ TermsConstants.MAX_TAGS_SUGGESTIONS }
				/>
			</label>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { setTags }, dispatch )
)( EditorTags );
