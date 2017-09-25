/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import VideoEditorControls from './video-editor-controls';
import Notice from 'components/notice';
import ProgressBar from 'components/progress-bar';
import DetailPreviewVideo from 'post-editor/media-modal/detail/detail-preview-video';
import { getPosterUploadProgress, getPosterUrl, shouldShowVideoEditorError } from 'state/selectors';
import { updatePoster } from 'state/ui/editor/video-editor/actions';

class VideoEditor extends Component {
	static propTypes = {
		className: PropTypes.string,
		media: PropTypes.object.isRequired,
		onCancel: PropTypes.func,
		onUpdatePoster: PropTypes.func,

		// Connected props
		posterUrl: PropTypes.string,
		shouldShowError: PropTypes.bool,
		uploadProgress: PropTypes.number,
	};

	static defaultProps = {
		onCancel: noop,
		onUpdatePoster: noop,
	};

	state = {
		error: false,
		isLoading: true,
		isSelectingFrame: false,
		pauseVideo: false,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.shouldShowError && ! this.props.shouldShowError ) {
			this.setState( {
				error: true,
				pauseVideo: false
			} );

			return;
		}

		if ( this.props.posterUrl !== nextProps.posterUrl ) {
			this.props.onUpdatePoster( this.getVideoEditorProps( nextProps.posterUrl ) );
		}
	}

	selectFrame = () => {
		const { isLoading } = this.state;

		if ( isLoading ) {
			this.setState( { error: true } );
			return;
		}

		this.setState( {
			error: false,
			isSelectingFrame: true,
			pauseVideo: true,
		} );
	}

	/**
   * Updates the poster by selecting a particular frame of the video.
   * @param {number} currentTime - Time at which to capture the frame
   */
	updatePoster = ( currentTime ) => {
		if ( ! this.state.isSelectingFrame ) {
			return;
		}

		const { media } = this.props;
		const guid = get( media, 'videopress_guid', null );

		if ( guid ) {
			this.props.updatePoster( guid, { atTime: currentTime } );
		}
	}

	setError = () => {
		this.setState( { error: true } );
	}

	setIsLoading = () => {
		this.setState( { isLoading: false } );
	}

	pauseVideo = () => {
		this.setState( {
			error: false,
			isSelectingFrame: false,
			pauseVideo: true,
		} );
	}

	/**
   * Uploads an image to use as the poster for the video.
   * @param {object} file - Uploaded image
   */
	uploadImage = ( file ) => {
		if ( ! file ) {
			return;
		}

		const { media } = this.props;
		const guid = get( media, 'videopress_guid', null );

		if ( guid ) {
			this.props.updatePoster( guid, { file } );
		}
	}

	getVideoEditorProps( posterUrl ) {
		const { media } = this.props;
		const videoProperties = { posterUrl };

		if ( media && media.ID ) {
			videoProperties.ID = media.ID;
		}

		return videoProperties;
	}

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
			media,
			onCancel,
			uploadProgress,
			translate,
		} = this.props;
		const {
			error,
			isLoading,
			isSelectingFrame,
			pauseVideo,
		} = this.state;

		const classes = classNames(
			'video-editor',
			className,
		);

		return (
			<div className={ classes }>
			{ error && this.renderError() }

				<figure>
					<div className="video-editor__content">
						<div className="video-editor__preview-wrapper">
							<DetailPreviewVideo
								className="video-editor__preview"
								isPlaying={ ! pauseVideo }
								item={ media }
								onPause={ this.updatePoster }
								onScriptLoadError={ this.setError }
								onVideoLoaded={ this.setIsLoading }
							/>
						</div>
						{ uploadProgress && ! error && ! isSelectingFrame &&
							<ProgressBar
								className="video-editor__progress-bar"
								isPulsing={ true }
								total={ 100 }
								value={ uploadProgress } />
						}
						<span className="video-editor__text">
							{ translate( 'Select a frame to use as the thumbnail image or upload your own.' ) }
						</span>
						<VideoEditorControls
							isPosterUpdating={ uploadProgress && ! error }
							isVideoLoading={ isLoading }
							onCancel={ onCancel }
							onSelectFrame={ this.selectFrame }
							onUploadImage={ this.uploadImage }
							onUploadImageClick={ this.pauseVideo }
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
			posterUrl: getPosterUrl( state ),
			shouldShowError: shouldShowVideoEditorError( state ),
			uploadProgress: getPosterUploadProgress( state ),
		};
	},
	{ updatePoster }
)( localize( VideoEditor ) );
