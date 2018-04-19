/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordStat, recordEvent } from 'lib/posts/stats';
import TrackInputChanges from 'components/track-input-changes';
import FormTextarea from 'components/forms/form-textarea';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { editPost } from 'state/posts/actions';

class EditorExcerpt extends React.Component {
	recordExcerptChangeStats = () => {
		recordStat( 'excerpt_changed' );
		recordEvent( 'Changed Excerpt' );
	};

	onExcerptChange = event => {
		const excerpt = event.target.value;
		this.props.editPost( this.props.siteId, this.props.postId, { excerpt } );
	};

	render() {
		const { excerpt, translate } = this.props;

		return (
			<TrackInputChanges onNewValue={ this.recordExcerptChangeStats }>
				<FormTextarea
					id="excerpt"
					name="excerpt"
					onChange={ this.onExcerptChange }
					value={ excerpt }
					placeholder={ translate( 'Write an excerpt…' ) }
					aria-label={ translate( 'Write an excerpt…' ) }
				/>
			</TrackInputChanges>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const excerpt = getEditedPostValue( state, siteId, postId, 'excerpt' );

		return { siteId, postId, excerpt };
	},
	{
		editPost,
	}
)( localize( EditorExcerpt ) );
