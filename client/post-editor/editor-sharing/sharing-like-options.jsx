/** @format */

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
import EditorFieldset from 'post-editor/editor-fieldset';
import FormCheckbox from 'components/forms/form-checkbox';
import PostActions from 'lib/posts/actions';
import { recordStat, recordEvent } from 'lib/posts/stats';
import { isEditorNewPost } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackModuleActive } from 'state/sites/selectors';

class SharingLikeOptions extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		isSharingButtonsEnabled: PropTypes.bool,
		isLikesEnabled: PropTypes.bool,
		isNew: PropTypes.bool,
	};

	isShowingSharingButtons = () => {
		if ( this.props.post && 'sharing_enabled' in this.props.post ) {
			return this.props.post.sharing_enabled;
		}

		if ( this.props.site && this.props.isNew ) {
			return this.props.site.options.default_sharing_status;
		}

		return true;
	};

	isShowingLikeButton = () => {
		if ( this.props.post && 'likes_enabled' in this.props.post ) {
			return this.props.post.likes_enabled;
		}

		if ( this.props.site && this.props.isNew ) {
			return this.props.site.options.default_likes_enabled;
		}

		return true;
	};

	renderSharingButtonField = () => {
		if ( ! this.props.isSharingButtonsEnabled ) {
			return;
		}

		return (
			<label>
				<FormCheckbox
					name="sharing_enabled"
					checked={ this.isShowingSharingButtons() }
					onChange={ this.onChange }
				/>
				<span>{ this.props.translate( 'Show Sharing Buttons', { context: 'Post Editor' } ) }</span>
			</label>
		);
	};

	renderLikesButtonField = () => {
		if ( ! this.props.isLikesEnabled ) {
			return;
		}

		return (
			<label>
				<FormCheckbox
					name="likes_enabled"
					checked={ this.isShowingLikeButton() }
					onChange={ this.onChange }
				/>
				<span>{ this.props.translate( 'Show Like Button', { context: 'Post Editor' } ) }</span>
			</label>
		);
	};

	onChange = event => {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			[ event.target.name ]: event.target.checked,
		} );

		this.recordStats( event );
	};

	recordStats = event => {
		let mcStat = event.target.name,
			eventStat = 'sharing_enabled' === event.target.name ? 'Sharing Buttons' : 'Like Button';

		mcStat += event.target.checked ? '_enabled' : '_disabled';
		eventStat += event.target.checked ? ' Enabled' : ' Disabled';

		recordStat( mcStat );
		recordEvent( eventStat );
	};

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

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		isSharingButtonsEnabled: false !== isJetpackModuleActive( state, siteId, 'sharedaddy' ),
		isLikesEnabled: false !== isJetpackModuleActive( state, siteId, 'likes' ),
		isNew: isEditorNewPost( state ),
	};
} )( localize( SharingLikeOptions ) );
