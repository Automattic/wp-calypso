/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import DetailPreviewVideo from 'post-editor/media-modal/detail/detail-preview-video';
import VideoEditorButtons from './video-editor-buttons';
import {
	videoEditorHasScriptLoadError,
} from 'state/ui/editor/video-editor/selectors';

class VideoEditor extends Component {
	static propTypes = {
		className: PropTypes.string,
		media: PropTypes.object.isRequired,
		onCancel: PropTypes.func,

		// Connected props
		hasScriptLoadError: PropTypes.bool,
	};

	static defaultProps = {
		onCancel: noop,
	};

	handleSelectFrame() {}

	handleUploadImage() {}

	renderError() {
		const {
			onCancel,
			translate,
		} = this.props;

		return (
			<Notice
				status="is-error"
				showDismiss={ true }
				text={ translate( 'We are unable to edit this video.' ) }
				isCompact={ false }
				onDismissClick={ onCancel } />
		);
	}

	render() {
		const {
			className,
			hasScriptLoadError,
			media,
			onCancel,
			translate,
		} = this.props;

		const classes = classNames(
			'video-editor',
			className,
		);

		return (
			<div className={ classes }>
				{ hasScriptLoadError && this.renderError() }

				<figure>
					<div className="video-editor__content">
						<div className="video-editor__preview-wrapper">
							<DetailPreviewVideo
								className="video-editor__preview"
								item={ media }
							/>
						</div>
						<span className="video-editor__text">
							{ translate( 'Select a frame to use as the thumbnail image or upload your own.' ) }
						</span>
						<VideoEditorButtons
							onCancel={ onCancel }
							onSelectFrame={ this.handleSelectFrame }
							onUploadImage={ this.handleUploadImage }
						/>
					</div>
				</figure>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		return {
			hasScriptLoadError: videoEditorHasScriptLoadError( state ),
		};
	}
)( localize( VideoEditor ) );
