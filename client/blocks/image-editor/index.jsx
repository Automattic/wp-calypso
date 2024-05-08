import path from 'path';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CloseOnEscape from 'calypso/components/close-on-escape';
import QuerySites from 'calypso/components/data/query-sites';
import Notice from 'calypso/components/notice';
import { getMimeType, url } from 'calypso/lib/media/utils';
import {
	resetImageEditorState,
	resetAllImageEditorState,
	setImageEditorFileInfo,
	setImageEditorDefaultAspectRatio,
} from 'calypso/state/editor/image-editor/actions';
import { AspectRatios, AspectRatiosValues } from 'calypso/state/editor/image-editor/constants';
import {
	getImageEditorFileInfo,
	isImageEditorImageLoaded,
} from 'calypso/state/editor/image-editor/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import ImageEditorButtons from './image-editor-buttons';
import ImageEditorCanvas from './image-editor-canvas';
import ImageEditorToolbar from './image-editor-toolbar';
import { getDefaultAspectRatio } from './utils';

import './style.scss';

const noop = () => {};

class ImageEditor extends Component {
	static propTypes = {
		// Component props
		media: PropTypes.object,
		siteId: PropTypes.number,
		onDone: PropTypes.func,
		onCancel: PropTypes.func,
		onReset: PropTypes.func,
		className: PropTypes.string,
		defaultAspectRatio: PropTypes.oneOf( AspectRatiosValues ),
		allowedAspectRatios: PropTypes.arrayOf( PropTypes.oneOf( AspectRatiosValues ) ),

		// Redux props
		site: PropTypes.object,
		fileName: PropTypes.string,
		setImageEditorFileInfo: PropTypes.func,
		setImageEditorDefaultAspectRatio: PropTypes.func,
		translate: PropTypes.func,
		isImageLoaded: PropTypes.bool,
		displayOnlyIcon: PropTypes.bool,
	};

	static defaultProps = {
		media: null,
		onDone: noop,
		onCancel: null,
		onReset: noop,
		isImageLoaded: false,
		defaultAspectRatio: AspectRatios.FREE,
		allowedAspectRatios: AspectRatiosValues,
		setImageEditorDefaultAspectRatio: noop,
		displayOnlyIcon: false,
	};

	state = {
		noticeText: null,
		noticeStatus: 'is-info',
	};

	editCanvasRef = createRef();

	componentDidUpdate( prevProps ) {
		const { media } = this.props;

		if ( media && ! isEqual( prevProps.media, media ) ) {
			this.props.resetAllImageEditorState();
			this.updateFileInfo();
			this.setDefaultAspectRatio();
		}
	}

	componentDidMount() {
		this.updateFileInfo();
		this.setDefaultAspectRatio();
	}

	setDefaultAspectRatio = () => {
		const { defaultAspectRatio, allowedAspectRatios } = this.props;

		this.props.setImageEditorDefaultAspectRatio(
			getDefaultAspectRatio( defaultAspectRatio, allowedAspectRatios )
		);
	};

	updateFileInfo = () => {
		const { site, media } = this.props;

		let src;
		let fileName = 'default';
		let mimeType = 'image/png';
		let title = 'default';

		if ( media ) {
			src =
				media.src ||
				url( media, {
					photon: site && ! site.is_private,
				} );

			fileName = media.file || path.basename( src );

			mimeType = getMimeType( media ) || mimeType;

			title = media.title || title;
		}

		this.props.resetImageEditorState();
		this.props.setImageEditorFileInfo( src, fileName, mimeType, title );
	};

	convertBlobToImage = ( blob ) => {
		const { onDone } = this.props;

		// Create a new image from the canvas blob
		const transientImage = document.createElement( 'img' );
		const transientImageUrl = URL.createObjectURL( blob );
		const imageProperties = this.getImageEditorProps();

		// Onload, extend imageProperties with the height and width
		// of the newly edited image
		transientImage.onload = () => {
			URL.revokeObjectURL( transientImageUrl );

			onDone( null, blob, {
				...imageProperties,
				width: transientImage.width,
				height: transientImage.height,
			} );
		};

		// onerror, we send the image properties
		// without the transient image's dimensions
		transientImage.onerror = () => {
			onDone( null, blob, imageProperties );
		};

		transientImage.src = transientImageUrl;
	};

	onDone = () => {
		const { isImageLoaded, onDone } = this.props;

		if ( ! isImageLoaded ) {
			onDone( new Error( 'Image not loaded yet.' ), null, this.getImageEditorProps() );
			return;
		}

		this.editCanvasRef.current.toBlob( this.convertBlobToImage );
	};

	onCancel = () => {
		this.props.onCancel( this.getImageEditorProps() );
	};

	onReset = () => {
		this.props.resetImageEditorState();

		this.props.onReset( this.getImageEditorProps() );
	};

	getImageEditorProps = () => {
		const { src, fileName, media, mimeType, title, site } = this.props;

		const imageProperties = {
			src,
			fileName,
			mimeType,
			title,
			site,
			resetAllImageEditorState: this.props.resetAllImageEditorState,
		};

		if ( media && media.ID ) {
			imageProperties.ID = media.ID;
		}

		return imageProperties;
	};

	showNotice = ( noticeText, noticeStatus = 'is-info' ) => {
		this.setState( {
			noticeText,
			noticeStatus,
		} );
	};

	clearNoticeState = () => {
		this.setState( {
			noticeText: null,
			noticeStatus: 'is-info',
		} );
	};

	renderNotice = () => {
		if ( ! this.state.noticeText ) {
			return null;
		}

		const showDismiss = this.state.noticeStatus === 'is-info';

		return (
			<Notice
				status={ this.state.noticeStatus }
				showDismiss={ showDismiss }
				text={ this.state.noticeText }
				isCompact={ false }
				onDismissClick={ this.clearNoticeState }
				className="image-editor__notice"
			/>
		);
	};

	onLoadCanvasError = () => {
		const { translate } = this.props;
		this.showNotice(
			translate(
				'Sorry, there was a problem loading the image. Please close this editor and try selecting the image again.'
			),
			'is-error'
		);
	};

	render() {
		const { className, siteId, allowedAspectRatios, widthLimit, displayOnlyIcon } = this.props;

		const { noticeText } = this.state;

		const classes = clsx( 'image-editor', className );

		return (
			<div className={ classes }>
				<CloseOnEscape onEscape={ this.onCancel } />
				<QuerySites siteId={ siteId } />

				<figure>
					<div className="image-editor__content">
						<ImageEditorCanvas
							ref={ this.editCanvasRef }
							widthLimit={ widthLimit }
							onLoadError={ this.onLoadCanvasError }
						/>
						<ImageEditorToolbar
							onShowNotice={ this.showNotice }
							allowedAspectRatios={ allowedAspectRatios }
							displayOnlyIcon={ displayOnlyIcon }
						/>
						<ImageEditorButtons
							onCancel={ this.props.onCancel && this.onCancel }
							onDone={ this.onDone }
							onReset={ this.onReset }
							doneButtonText={ this.props.doneButtonText }
						/>
					</div>
				</figure>

				{ noticeText && this.renderNotice() }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		let siteId = ownProps.siteId;

		if ( ! siteId ) {
			siteId = getSelectedSiteId( state );
		}

		return {
			...getImageEditorFileInfo( state ),
			site: getSite( state, siteId ),
			isImageLoaded: isImageEditorImageLoaded( state ),
		};
	},
	( dispatch, ownProps ) => {
		const defaultAspectRatio = getDefaultAspectRatio(
			ownProps.defaultAspectRatio,
			ownProps.allowedAspectRatios
		);

		const resetActionsAdditionalData = {
			aspectRatio: defaultAspectRatio,
		};

		return bindActionCreators(
			{
				setImageEditorFileInfo,
				setImageEditorDefaultAspectRatio,
				resetImageEditorState: () => resetImageEditorState( resetActionsAdditionalData ),
				resetAllImageEditorState: () => resetAllImageEditorState( resetActionsAdditionalData ),
			},
			dispatch
		);
	}
)( localize( ImageEditor ) );
