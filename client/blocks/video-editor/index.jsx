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
import DetailPreviewVideo from 'post-editor/media-modal/detail/detail-preview-video';
import VideoEditorButtons from './video-editor-buttons';

class VideoEditor extends Component {
	static propTypes = {
		className: PropTypes.string,
		media: PropTypes.object,
		onCancel: PropTypes.func,

		// Connected props
		translate: PropTypes.func,
	};

	static defaultProps = {
		media: null,
		onCancel: noop,
	};

	handleSelectFrame() {}

	handleUploadImage() {}

	render() {
		const {
			className,
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
				<figure>
					<div className="video-editor__content">
						<div className="video-editor__preview-wrapper">
							<DetailPreviewVideo
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

export default connect()( localize( VideoEditor ) );
