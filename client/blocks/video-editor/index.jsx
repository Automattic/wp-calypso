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
	resetVideoEditorPosterState,
	resetVideoEditorState,
	updateVideoEditorPoster,
} from 'state/ui/editor/video-editor/actions';
import {
	isVideoEditorPosterUpdated,
	videoEditorHasPosterUpdateError,
	videoEditorHasScriptLoadError,
} from 'state/ui/editor/video-editor/selectors';

class VideoEditor extends Component {
	static propTypes = {
		className: PropTypes.string,
		media: PropTypes.object.isRequired,
		onCancel: PropTypes.func,
		onUpdatePoster: PropTypes.func,

		// Connected props
		hasPosterUpdateError: PropTypes.bool,
		hasScriptLoadError: PropTypes.bool,
		isPosterUpdated: PropTypes.bool,
	};

	static defaultProps = {
		onCancel: noop,
		onUpdatePoster: noop,
	};

	state = {
		pauseVideo: false,
	};

	componentDidMount() {
		this.props.resetState();
	}

	shouldComponentUpdate( nextProps ) {
		if ( nextProps.isPosterUpdated && ! nextProps.hasPosterUpdateError ) {
			this.props.onUpdatePoster();
		}

		return true;
	}

	handleSelectFrame = () => {
		this.props.resetPosterState();
		this.setState( { pauseVideo: true } );
	}

	handlePause = ( currentTime ) => {
		const {
			media,
			updatePoster,
		} = this.props;
		const guid = media && media.videopress_guid ? media.videopress_guid : null;

		if ( guid ) {
			updatePoster( guid, { at_time: Math.floor( currentTime ) } );
		}
	}

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
			hasPosterUpdateError,
			hasScriptLoadError,
			media,
			onCancel,
			translate,
		} = this.props;
		const {
			pauseVideo,
		} = this.state;

		const classes = classNames(
			'video-editor',
			className,
		);

		return (
			<div className={ classes }>
				{ ( hasScriptLoadError || hasPosterUpdateError ) && this.renderError() }

				<figure>
					<div className="video-editor__content">
						<div className="video-editor__preview-wrapper">
							<DetailPreviewVideo
								className="video-editor__preview"
								isPlaying={ ! pauseVideo }
								item={ media }
								onPause={ this.handlePause }
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
			hasPosterUpdateError: videoEditorHasPosterUpdateError( state ),
			hasScriptLoadError: videoEditorHasScriptLoadError( state ),
			isPosterUpdated: isVideoEditorPosterUpdated( state ),
		};
	},
	{
		resetPosterState: resetVideoEditorPosterState,
		resetState: resetVideoEditorState,
		updatePoster: updateVideoEditorPoster,
	}
)( localize( VideoEditor ) );
