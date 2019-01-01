/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { getBlobByURL, revokeBlobURL, isBlobURL } from '@wordpress/blob';
import { ClipboardButton, IconButton, Toolbar, withNotices } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { Component, Fragment } from '@wordpress/element';
import {
	MediaUpload,
	MediaPlaceholder,
	MediaUploadCheck,
	BlockControls,
	RichText,
	mediaUpload,
} from '@wordpress/editor';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import FileBlockInspector from './inspector';

class FileEdit extends Component {
	constructor() {
		super( ...arguments );

		this.onSelectFile = this.onSelectFile.bind( this );
		this.confirmCopyURL = this.confirmCopyURL.bind( this );
		this.resetCopyConfirmation = this.resetCopyConfirmation.bind( this );
		this.changeLinkDestinationOption = this.changeLinkDestinationOption.bind( this );
		this.changeOpenInNewWindow = this.changeOpenInNewWindow.bind( this );
		this.changeShowDownloadButton = this.changeShowDownloadButton.bind( this );

		this.state = {
			hasError: false,
			showCopyConfirmation: false,
		};
	}

	componentDidMount() {
		const { attributes, noticeOperations } = this.props;
		const { href } = attributes;

		// Upload a file drag-and-dropped into the editor
		if ( isBlobURL( href ) ) {
			const file = getBlobByURL( href );

			mediaUpload( {
				filesList: [ file ],
				onFileChange: ( [ media ] ) => this.onSelectFile( media ),
				onError: message => {
					this.setState( { hasError: true } );
					noticeOperations.createErrorNotice( message );
				},
			} );

			revokeBlobURL( href );
		}
	}

	componentDidUpdate( prevProps ) {
		// Reset copy confirmation state when block is deselected
		if ( prevProps.isSelected && ! this.props.isSelected ) {
			/* eslint-disable-next-line react/no-did-update-set-state */
			this.setState( { showCopyConfirmation: false } );
		}
	}

	onSelectFile( media ) {
		if ( media && media.url ) {
			this.setState( { hasError: false } );
			this.props.setAttributes( {
				href: media.url,
				fileName: media.title,
				textLinkHref: media.url,
				id: media.id,
			} );
		}
	}

	confirmCopyURL() {
		this.setState( { showCopyConfirmation: true } );
	}

	resetCopyConfirmation() {
		this.setState( { showCopyConfirmation: false } );
	}

	changeLinkDestinationOption( newHref ) {
		// Choose Media File or Attachment Page (when file is in Media Library)
		this.props.setAttributes( { textLinkHref: newHref } );
	}

	changeOpenInNewWindow( newValue ) {
		this.props.setAttributes( {
			textLinkTarget: newValue ? '_blank' : false,
		} );
	}

	changeShowDownloadButton( newValue ) {
		this.props.setAttributes( { showDownloadButton: newValue } );
	}

	render() {
		const {
			className,
			isSelected,
			attributes,
			setAttributes,
			noticeUI,
			noticeOperations,
			media,
		} = this.props;
		const {
			fileName,
			href,
			textLinkHref,
			textLinkTarget,
			showDownloadButton,
			downloadButtonText,
			id,
		} = attributes;
		const { hasError, showCopyConfirmation } = this.state;
		const attachmentPage = media && media.link;

		if ( ! href || hasError ) {
			return (
				<MediaPlaceholder
					icon="media-default"
					labels={ {
						title: __( 'File' ),
						instructions: __( 'Drag a file, upload a new one or select a file from your library.' ),
					} }
					onSelect={ this.onSelectFile }
					notices={ noticeUI }
					onError={ noticeOperations.createErrorNotice }
					accept="*"
				/>
			);
		}

		const classes = classnames( className, {
			'is-transient': isBlobURL( href ),
		} );

		return (
			<Fragment>
				<FileBlockInspector
					hrefs={ { href, textLinkHref, attachmentPage } }
					{ ...{
						openInNewWindow: !! textLinkTarget,
						showDownloadButton,
						changeLinkDestinationOption: this.changeLinkDestinationOption,
						changeOpenInNewWindow: this.changeOpenInNewWindow,
						changeShowDownloadButton: this.changeShowDownloadButton,
					} }
				/>
				<BlockControls>
					<MediaUploadCheck>
						<Toolbar>
							<MediaUpload
								onSelect={ this.onSelectFile }
								value={ id }
								render={ ( { open } ) => (
									<IconButton
										className="components-toolbar__control"
										label={ __( 'Edit file' ) }
										onClick={ open }
										icon="edit"
									/>
								) }
							/>
						</Toolbar>
					</MediaUploadCheck>
				</BlockControls>
				<div className={ classes }>
					<div className={ `${ className }__content-wrapper` }>
						<RichText
							wrapperClassName={ `${ className }__textlink` }
							tagName="div" // must be block-level or else cursor disappears
							value={ fileName }
							placeholder={ __( 'Write file name…' ) }
							keepPlaceholderOnFocus
							formattingControls={ [] } // disable controls
							onChange={ text => setAttributes( { fileName: text } ) }
						/>
						{ showDownloadButton && (
							<div className={ `${ className }__button-richtext-wrapper` }>
								{ /* Using RichText here instead of PlainText so that it can be styled like a button */ }
								<RichText
									tagName="div" // must be block-level or else cursor disappears
									className={ `${ className }__button` }
									value={ downloadButtonText }
									formattingControls={ [] } // disable controls
									placeholder={ __( 'Add text…' ) }
									keepPlaceholderOnFocus
									onChange={ text => setAttributes( { downloadButtonText: text } ) }
								/>
							</div>
						) }
					</div>
					{ isSelected && (
						<ClipboardButton
							isDefault
							text={ href }
							className={ `${ className }__copy-url-button` }
							onCopy={ this.confirmCopyURL }
							onFinishCopy={ this.resetCopyConfirmation }
							disabled={ isBlobURL( href ) }
						>
							{ showCopyConfirmation ? __( 'Copied!' ) : __( 'Copy URL' ) }
						</ClipboardButton>
					) }
				</div>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select, props ) => {
		const { getMedia } = select( 'core' );
		const { id } = props.attributes;
		return {
			media: id === undefined ? undefined : getMedia( id ),
		};
	} ),
	withNotices,
] )( FileEdit );
