/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ProgressBar from 'components/progress-bar';
import Notice from 'components/notice';
import DetailPreviewVideo from 'post-editor/media-modal/detail/detail-preview-video';
import VideoEditorButtons from './video-editor-buttons';
import {
	resetVideoEditorPosterState,
	resetVideoEditorState,
	updateVideoEditorPoster,
} from 'state/ui/editor/video-editor/actions';
import {
	getVideoEditorPoster,
	getVideoUploadProgress,
	isVideoEditorPosterUpdated,
	videoEditorHasPosterUpdateError,
} from 'state/ui/editor/video-editor/selectors';

/**
 * Module variables
 */
let isSelectingFrame = false;

class VideoEditor extends Component {
	static propTypes = {
		className: PropTypes.string,
		media: PropTypes.object.isRequired,
		onCancel: PropTypes.func,
		onUpdatePoster: PropTypes.func,

		// Connected props
		hasPosterUpdateError: PropTypes.bool,
		isPosterUpdated: PropTypes.bool,
		poster: PropTypes.string,
		uploadProgress: PropTypes.number,
	};

	static defaultProps = {
		onCancel: noop,
		onUpdatePoster: noop,
	};

	state = {
		error: false,
		isLoading: true,
		pauseVideo: false,
	};

	componentDidMount() {
		this.props.resetState();
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.isPosterUpdated ) {
			return;
		}

		if ( nextProps.hasPosterUpdateError ) {
			this.setState( {
				error: true,
				pauseVideo: false
			} );

			return;
		}

		this.props.onUpdatePoster( this.getVideoEditorProps( nextProps.poster ) );
	}

	handleSelectFrame = () => {
		const { isLoading } = this.state;

		this.props.resetPosterState();

		if ( isLoading ) {
			this.setState( { error: true } );
			return;
		}

		isSelectingFrame = true;

		this.setState( {
			error: false,
			pauseVideo: true
		} );
	}

	handlePause = ( currentTime ) => {
		if ( ! isSelectingFrame ) {
			return;
		}

		const {
			media,
			updatePoster,
		} = this.props;
		const guid = media && media.videopress_guid ? media.videopress_guid : null;

		if ( guid ) {
			updatePoster( guid, { at_time: Math.floor( currentTime ) } );
		}
	}

	handleScriptLoadError = () => {
		this.setState( { error: true } );
	}

	handleVideoLoaded = () => {
		this.setState( { isLoading: false } );
	}

	handleUploadImageClick = () => {
		isSelectingFrame = false;

		this.props.resetPosterState();
		this.setState( {
			error: false,
			pauseVideo: true
		} );
	}

	handleUploadImage = ( file ) => {
		if ( ! file ) {
			return;
		}

		const {
			media,
			updatePoster,
		} = this.props;
		const guid = media && media.videopress_guid ? media.videopress_guid : null;

		if ( guid ) {
			updatePoster( guid, { file } );
		}
	}

	getVideoEditorProps( poster ) {
		const { media } = this.props;
		const videoProperties = { poster };

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
			isLoading,
			pauseVideo,
			error,
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
								onPause={ this.handlePause }
								onScriptLoadError={ this.handleScriptLoadError }
								onVideoLoaded={ this.handleVideoLoaded }
							/>
							{ !! uploadProgress && ! error && ! isSelectingFrame &&
								<ProgressBar
									isPulsing={ true }
									total={ 100 }
									value={ uploadProgress } />
							}
						</div>
						<span className="video-editor__text">
							{ translate( 'Select a frame to use as the thumbnail image or upload your own.' ) }
						</span>
						<VideoEditorButtons
							isPosterUpdating={ !! uploadProgress && ! error }
							isVideoLoading={ isLoading }
							onCancel={ onCancel }
							onSelectFrame={ this.handleSelectFrame }
							onUploadImage={ this.handleUploadImage }
							onUploadImageClick={ this.handleUploadImageClick }
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
			isPosterUpdated: isVideoEditorPosterUpdated( state ),
			poster: getVideoEditorPoster( state ),
			uploadProgress: getVideoUploadProgress( state ),
		};
	},
	dispatch => bindActionCreators( {
		resetPosterState: resetVideoEditorPosterState,
		resetState: resetVideoEditorState,
		updatePoster: updateVideoEditorPoster,
	}, dispatch ),
)( localize( VideoEditor ) );
