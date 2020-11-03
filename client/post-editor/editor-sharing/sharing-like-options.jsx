/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EditorFieldset from 'calypso/post-editor/editor-fieldset';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import { recordEditorStat, recordEditorEvent } from 'calypso/state/posts/stats';
import { isEditorNewPost, getEditorPostId } from 'calypso/state/editor/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSite, isJetpackModuleActive } from 'calypso/state/sites/selectors';
import { getEditedPost } from 'calypso/state/posts/selectors';
import { editPost } from 'calypso/state/posts/actions';

class SharingLikeOptions extends React.Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		isSharingButtonsEnabled: PropTypes.bool,
		isLikesEnabled: PropTypes.bool,
		isShowingSharingButtons: PropTypes.bool,
		isShowingLikeButton: PropTypes.bool,
	};

	renderSharingButtonField() {
		if ( ! this.props.isSharingButtonsEnabled ) {
			return;
		}

		return (
			<FormLabel>
				<FormCheckbox
					name="sharing_enabled"
					checked={ this.props.isShowingSharingButtons }
					onChange={ this.onChange }
				/>
				<span>{ this.props.translate( 'Show Sharing Buttons', { context: 'Post Editor' } ) }</span>
			</FormLabel>
		);
	}

	renderLikesButtonField() {
		if ( ! this.props.isLikesEnabled ) {
			return;
		}

		return (
			<FormLabel>
				<FormCheckbox
					name="likes_enabled"
					checked={ this.props.isShowingLikeButton }
					onChange={ this.onChange }
				/>
				<span>{ this.props.translate( 'Show Like Button', { context: 'Post Editor' } ) }</span>
			</FormLabel>
		);
	}

	onChange = ( event ) => {
		this.props.editPost( this.props.siteId, this.props.postId, {
			[ event.target.name ]: event.target.checked,
		} );

		this.recordStats( event );
	};

	recordStats( event ) {
		let mcStat = event.target.name,
			eventStat = 'sharing_enabled' === event.target.name ? 'Sharing Buttons' : 'Like Button';

		mcStat += event.target.checked ? '_enabled' : '_disabled';
		eventStat += event.target.checked ? ' Enabled' : ' Disabled';

		this.props.recordEditorStat( mcStat );
		this.props.recordEditorEvent( eventStat );
	}

	render() {
		if ( ! this.props.isSharingButtonsEnabled && ! this.props.isLikesEnabled ) {
			return null;
		}

		return (
			<EditorFieldset
				className="editor-sharing__sharing-like-options"
				legend={ this.props.translate( 'Sharing Buttons & Likes' ) }
			>
				{ this.renderSharingButtonField() }
				{ this.renderLikesButtonField() }
			</EditorFieldset>
		);
	}
}

function isShowingSharingButtons( site, post, isNew ) {
	if ( post && 'sharing_enabled' in post ) {
		return post.sharing_enabled;
	}

	if ( site && isNew ) {
		return site.options.default_sharing_status;
	}

	return true;
}

function isShowingLikeButton( site, post, isNew ) {
	if ( post && 'likes_enabled' in post ) {
		return post.likes_enabled;
	}

	if ( site && isNew ) {
		return site.options.default_likes_enabled;
	}

	return true;
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSite( state, siteId );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );
		const isNew = isEditorNewPost( state );

		return {
			siteId,
			postId,
			isSharingButtonsEnabled: false !== isJetpackModuleActive( state, siteId, 'sharedaddy' ),
			isLikesEnabled: false !== isJetpackModuleActive( state, siteId, 'likes' ),
			isShowingSharingButtons: isShowingSharingButtons( site, post, isNew ),
			isShowingLikeButton: isShowingLikeButton( site, post, isNew ),
		};
	},
	{ editPost, recordEditorStat, recordEditorEvent }
)( localize( SharingLikeOptions ) );
