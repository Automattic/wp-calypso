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
	isVideoEditorVideoLoaded,
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
		isVideoLoaded: PropTypes.bool,
	};

	static defaultProps = {
		onCancel: noop,
		onUpdatePoster: noop,
	};

	state = {
		pauseVideo: false,
		videoError: false,
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
		const { isVideoLoaded } = this.props;

		this.props.resetPosterState();

		if ( ! isVideoLoaded ) {
			this.setState( { videoError: true } );
			return;
		}

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
			isVideoLoaded,
			media,
			onCancel,
			translate,
		} = this.props;
		const {
			pauseVideo,
			videoError,
		} = this.state;

		const classes = classNames(
			'video-editor',
			className,
		);

		return (
			<div className={ classes }>
				{ ( hasScriptLoadError || hasPosterUpdateError || videoError ) && this.renderError() }

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
							isVideoLoaded={ isVideoLoaded }
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
			isVideoLoaded: isVideoEditorVideoLoaded( state ),
		};
	},
	{
		resetPosterState: resetVideoEditorPosterState,
		resetState: resetVideoEditorState,
		updatePoster: updateVideoEditorPoster,
	}
)( localize( VideoEditor ) );
