import { ProgressBar } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import DetailPreviewVideo from 'calypso/post-editor/media-modal/detail/detail-preview-video';
import { updatePoster } from 'calypso/state/editor/video-editor/actions';
import getPosterUploadProgress from 'calypso/state/selectors/get-poster-upload-progress';
import getPosterUrl from 'calypso/state/selectors/get-poster-url';
import shouldShowVideoEditorError from 'calypso/state/selectors/should-show-video-editor-error';
import VideoEditorControls from './video-editor-controls';

import './style.scss';

const noop = () => {};

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

	componentDidUpdate( prevProps ) {
		if ( prevProps.posterUrl !== this.props.posterUrl ) {
			this.props.onUpdatePoster( this.getVideoEditorProps() );
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
	};

	/**
	 * Updates the poster by selecting a particular frame of the video.
	 *
	 * @param {number} currentTime - Time at which to capture the frame
	 * @param {boolean} isMillisec - Whether the time is in milliseconds
	 */
	updatePoster = ( currentTime, isMillisec ) => {
		if ( ! this.state.isSelectingFrame ) {
			return;
		}

		const { media } = this.props;
		const guid = media?.videopress_guid;

		if ( guid ) {
			this.props.updatePoster(
				guid,
				{
					atTime: currentTime,
					isMillisec,
				},
				{ mediaId: media.ID }
			);
		}
	};

	setError = () => {
		this.setState( { error: true } );
	};

	setIsLoading = () => {
		this.setState( { isLoading: false } );
	};

	setIsPlaying = ( isPlaying ) => this.setState( { pauseVideo: ! isPlaying } );

	pauseVideo = () => {
		this.setState( {
			error: false,
			isSelectingFrame: false,
			pauseVideo: true,
		} );
	};

	/**
	 * Uploads an image to use as the poster for the video.
	 *
	 * @param {Object} file - Uploaded image
	 */
	uploadImage = ( file ) => {
		if ( ! file ) {
			return;
		}

		const { media } = this.props;
		const guid = media?.videopress_guid;

		if ( guid ) {
			this.props.updatePoster( guid, { file }, { mediaId: media.ID } );
		}
	};

	getVideoEditorProps() {
		const { media, posterUrl } = this.props;
		const videoProperties = { posterUrl };

		if ( media && media.ID ) {
			videoProperties.ID = media.ID;
		}

		return videoProperties;
	}

	renderError() {
		const { onCancel, translate } = this.props;

		return (
			<Notice
				className="video-editor__notice"
				status="is-error"
				showDismiss={ true }
				text={ translate( 'We are unable to edit this video.' ) }
				isCompact={ false }
				onDismissClick={ onCancel }
			/>
		);
	}

	render() {
		const { className, media, onCancel, uploadProgress, translate, shouldShowError } = this.props;
		const { error, isLoading, isSelectingFrame, pauseVideo } = this.state;

		const classes = classNames( 'video-editor', className );

		return (
			<div className={ classes }>
				<figure>
					<div className="video-editor__content">
						<div className="video-editor__preview-wrapper">
							<DetailPreviewVideo
								className="video-editor__preview"
								isPlaying={ ! pauseVideo }
								setIsPlaying={ this.setIsPlaying }
								isSelectingFrame={ isSelectingFrame }
								item={ media }
								onPause={ this.updatePoster }
								onScriptLoadError={ this.setError }
								onVideoLoaded={ this.setIsLoading }
							/>
						</div>
						{ uploadProgress && ! error && (
							<ProgressBar
								className="video-editor__progress-bar"
								isPulsing={ true }
								total={ 100 }
								value={ uploadProgress }
							/>
						) }
						<span className="video-editor__text">
							{ translate( 'Select a frame to use as the thumbnail image or upload your own.' ) }
						</span>
						<VideoEditorControls
							isPosterUpdating={ isSelectingFrame || ( uploadProgress && ! error ) }
							isVideoLoading={ isLoading }
							onCancel={ onCancel }
							onSelectFrame={ this.selectFrame }
							onUploadImage={ this.uploadImage }
							onUploadImageClick={ this.pauseVideo }
						/>
					</div>
				</figure>

				{ ( error || shouldShowError ) && this.renderError() }
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
