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
import Spinner from 'components/spinner';
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
	isVideoEditorPosterUpdated,
	isVideoEditorPosterUpdating,
	isVideoEditorVideoLoaded,
	videoEditorHasPosterUpdateError,
	videoEditorHasScriptLoadError,
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
		hasScriptLoadError: PropTypes.bool,
		isPosterUpdated: PropTypes.bool,
		isPosterUpdating: PropTypes.bool,
		isVideoLoaded: PropTypes.bool,
		poster: PropTypes.string,
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

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.isPosterUpdated ) {
			return;
		}

		if ( nextProps.hasPosterUpdateError ) {
			this.setState( { pauseVideo: false } );
			return;
		}

		this.props.onUpdatePoster( this.getVideoEditorProps( nextProps.poster ) );
	}

	handleSelectFrame = () => {
		const { isVideoLoaded } = this.props;

		this.props.resetPosterState();

		if ( ! isVideoLoaded ) {
			this.setState( { videoError: true } );
			return;
		}

		isSelectingFrame = true;
		this.setState( { pauseVideo: true } );
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

	handleUploadImageClick = () => {
		isSelectingFrame = false;
		this.setState( { pauseVideo: true } );
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
			this.props.resetPosterState();
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
			hasPosterUpdateError,
			hasScriptLoadError,
			isPosterUpdating,
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
							{ isPosterUpdating && <Spinner /> }
						</div>
						<span className="video-editor__text">
							{ translate( 'Select a frame to use as the thumbnail image or upload your own.' ) }
						</span>
						<VideoEditorButtons
							isPosterUpdating={ isPosterUpdating }
							isVideoLoaded={ isVideoLoaded }
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
			hasScriptLoadError: videoEditorHasScriptLoadError( state ),
			isPosterUpdated: isVideoEditorPosterUpdated( state ),
			isPosterUpdating: isVideoEditorPosterUpdating( state ),
			isVideoLoaded: isVideoEditorVideoLoaded( state ),
			poster: getVideoEditorPoster( state ),
		};
	},
	{
		resetPosterState: resetVideoEditorPosterState,
		resetState: resetVideoEditorState,
		updatePoster: updateVideoEditorPoster,
	}
)( localize( VideoEditor ) );
