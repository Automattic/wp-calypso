/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	noop,
	isEqual,
	partial
} from 'lodash';
import path from 'path';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import ImageEditorCanvas from './image-editor-canvas';
import ImageEditorToolbar from './image-editor-toolbar';
import ImageEditorButtons from './image-editor-buttons';
import MediaUtils from 'lib/media/utils';
import closeOnEsc from 'lib/mixins/close-on-esc';
import {
	resetImageEditorState,
	resetAllImageEditorState,
	setImageEditorFileInfo,
	setImageEditorDefaultAspectRatio
} from 'state/ui/editor/image-editor/actions';
import {
	getImageEditorFileInfo,
	isImageEditorImageLoaded
} from 'state/ui/editor/image-editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite } from 'state/sites/selectors';
import QuerySites from 'components/data/query-sites';
import {
	AspectRatios,
	AspectRatiosValues
} from 'state/ui/editor/image-editor/constants';
import { getDefaultAspectRatio } from './utils';

const ImageEditor = React.createClass( {
	mixins: [ closeOnEsc( 'onCancel' ) ],

	propTypes: {
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
		isImageLoaded: PropTypes.bool
	},

	getDefaultProps() {
		return {
			media: null,
			onDone: noop,
			onCancel: null,
			onReset: noop,
			isImageLoaded: false,
			defaultAspectRatio: AspectRatios.FREE,
			allowedAspectRatios: AspectRatiosValues,
			setImageEditorDefaultAspectRatio: noop
		};
	},

	getInitialState() {
		return {
			canvasError: null
		};
	},

	componentWillReceiveProps( newProps ) {
		const {
			media: currentMedia
		} = this.props;

		if ( newProps.media && ! isEqual( newProps.media, currentMedia ) ) {
			this.props.resetAllImageEditorState();

			this.updateFileInfo( newProps.media );

			this.setDefaultAspectRatio();
		}
	},

	componentDidMount() {
		this.updateFileInfo( this.props.media );

		this.setDefaultAspectRatio();
	},

	setDefaultAspectRatio() {
		const {
			defaultAspectRatio,
			allowedAspectRatios
		} = this.props;

		this.props.setImageEditorDefaultAspectRatio(
			getDefaultAspectRatio( defaultAspectRatio, allowedAspectRatios )
		);
	},

	updateFileInfo( media ) {
		const {	site } = this.props;

		let src,
			fileName = 'default',
			mimeType = 'image/png',
			title = 'default';

		if ( media ) {
			src = media.src || MediaUtils.url( media, {
				photon: site && ! site.is_private
			} );

			fileName = media.file || path.basename( src );

			mimeType = MediaUtils.getMimeType( media ) || mimeType;

			title = media.title || title;
		}

		this.props.resetImageEditorState();
		this.props.setImageEditorFileInfo( src, fileName, mimeType, title );
	},

	onDone() {
		const { isImageLoaded, onDone } = this.props;

		if ( ! isImageLoaded ) {
			onDone( new Error( 'Image not loaded yet.' ), null, this.getImageEditorProps() );

			return;
		}

		const canvasComponent = this.refs.editCanvas.getWrappedInstance();

		canvasComponent.toBlob( ( blob ) => {
			onDone( null, blob, this.getImageEditorProps() );
		} );
	},

	onCancel() {
		this.props.onCancel( this.getImageEditorProps() );
	},

	onReset() {
		this.props.resetImageEditorState();

		this.props.onReset( this.getImageEditorProps() );
	},

	getImageEditorProps() {
		const {
			src,
			fileName,
			media,
			mimeType,
			title,
			site
		} = this.props;

		const imageProperties = {
			src,
			fileName,
			mimeType,
			title,
			site,
			resetAllImageEditorState: this.props.resetAllImageEditorState
		};

		if ( media && media.ID ) {
			imageProperties.ID = media.ID;
		}

		return imageProperties;
	},

	onLoadCanvasError() {
		const { translate } = this.props;

		this.setState( {
			canvasError: translate( 'We are unable to edit this image.' )
		} );
	},

	renderError() {
		return (
			<Notice
				status="is-error"
				showDismiss={ true }
				text={ this.state.canvasError }
				isCompact={ false }
				onDismissClick={ this.props.onImageEditorCancel } 	/>
		);
	},

	render() {
		const {
			className,
			siteId,
			allowedAspectRatios
		} = this.props;

		const classes = classNames(
			'image-editor',
			className
		);

		return (
			<div className={ classes }>
				{ this.state.canvasError && this.renderError() }

				<QuerySites siteId={ siteId } />

				<figure>
					<div className="image-editor__content">
						<ImageEditorCanvas
							ref="editCanvas"
							onLoadError={ this.onLoadCanvasError }
						/>
						<ImageEditorToolbar
							allowedAspectRatios={ allowedAspectRatios }
						/>
						<ImageEditorButtons
							onCancel={ this.props.onCancel && this.onCancel }
							onDone={ this.onDone }
							onReset={ this.onReset }
						/>
					</div>
				</figure>
			</div>
		);
	}
} );

export default connect(
	( state, ownProps ) => {
		let siteId = ownProps.siteId;

		if ( ! siteId ) {
			siteId = getSelectedSiteId( state );
		}

		return {
			...getImageEditorFileInfo( state ),
			site: getSite( state, siteId ),
			isImageLoaded: isImageEditorImageLoaded( state )
		};
	},
	( dispatch, ownProp ) => {
		const defaultAspectRatio = getDefaultAspectRatio(
			ownProp.defaultAspectRatio,
			ownProp.allowedAspectRatios
		);

		const resetActionsAdditionalData = {
			aspectRatio: defaultAspectRatio
		};

		return bindActionCreators( {
			setImageEditorFileInfo,
			setImageEditorDefaultAspectRatio,
			resetImageEditorState: partial( resetImageEditorState, resetActionsAdditionalData ),
			resetAllImageEditorState: partial( resetAllImageEditorState, resetActionsAdditionalData )

		}, dispatch );
	}
)( localize( ImageEditor ) );
