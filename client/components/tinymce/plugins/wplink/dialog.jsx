/**
 * External dependencies
 */
var React = require( 'react' ),
	tinymce = require( 'tinymce/tinymce' );

/**
 * Internal dependencies
 */
var MediaSerialization = require( 'lib/media-serialization' ),
	MediaStore = require( 'lib/media/store' ),
	MediaUtils = require( 'lib/media/utils' ),
	sites = require( 'lib/sites-list' )(),
	Dialog = require( 'components/dialog' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	FormCheckbox = require( 'components/forms/form-checkbox' ),
	FormButton = require( 'components/forms/form-button' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	Gridicon = require( 'components/gridicon' );

/**
 * Module variables
 */
var REGEXP_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
	REGEXP_URL = /^(https?|ftp):\/\/[A-Z0-9.-]+\.[A-Z]{2,4}[^ "]*$/i;

var LinkDialog = React.createClass( {

	getInitialState: function() {
		return this.getState();
	},

	getLink: function() {
		var editor = this.props.editor;

		return editor.dom.getParent( editor.selection.getNode(), 'a' );
	},

	updateEditor: function() {
		var editor = this.props.editor,
			attrs, link, linkText;

		editor.focus();

		if ( tinymce.isIE ) {
			editor.selection.moveToBookmark( editor.windowManager.bookmark );
		}

		if ( ! this.state.url ) {
			this.removeLink();
			return;
		}

		link = this.getLink();
		linkText = this.state.linkText;
		attrs = {
			href: this.state.url,
			target: this.state.newWindow ? '_blank' : ''
		};

		if ( link ) {
			if ( linkText ) {
				if ( 'innerText' in link ) {
					link.innerText = linkText;
				} else {
					link.textContent = linkText;
				}
			}

			editor.dom.setAttribs( link, attrs );
		} else if ( linkText ) {
			linkText = editor.dom.encode( linkText );
			editor.selection.setNode( editor.dom.create( 'a', attrs, linkText ) );
		} else {
			editor.execCommand( 'mceInsertLink', false, attrs );
		}

		this.closeDialog();
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.visible && ! this.state.showDialog ) {
			this.setState( this.getState() );
		}
	},

	hasSelectedText: function( linkNode ) {
		var editor = this.props.editor,
			html = editor.selection.getContent(),
			nodes, i;

		// Partial html and not a fully selected anchor element
		if ( /</.test( html ) && ( ! /^<a [^>]+>[^<]+<\/a>$/.test( html ) || html.indexOf( 'href=' ) === -1 ) ) {
			return false;
		}

		if ( linkNode ) {
			nodes = linkNode.childNodes;

			if ( nodes.length === 0 ) {
				return false;
			}

			for ( i = nodes.length - 1; i >= 0; i-- ) {
				if ( nodes[ i ].nodeType !== 3 ) {
					return false;
				}
			}
		}

		return true;
	},

	getInferredUrl: function() {
		var selectedText = this.props.editor.selection.getContent(),
			selectedNode, site, parsedImage, knownImage;

		if ( REGEXP_EMAIL.test( selectedText ) ) {
			return 'mailto:' + selectedText;
		} else if ( REGEXP_URL.test( selectedText ) ) {
			return selectedText.replace( /&amp;|&#0?38;/gi, '&' );
		}

		selectedNode = this.props.editor.selection.getNode();
		site = sites.getSelectedSite();
		if ( selectedNode && 'IMG' === selectedNode.nodeName ) {
			parsedImage = MediaSerialization.deserialize( selectedNode );
			if ( site && parsedImage.media.ID ) {
				knownImage = MediaStore.get( site.ID, parsedImage.media.ID ) || parsedImage.media;
				return MediaUtils.url( knownImage, {
					size: 'full'
				} );
			} else if ( parsedImage.media.URL ) {
				return parsedImage.media.URL;
			}
		}
	},

	getState: function() {
		var editor = this.props.editor,
			selectedNode = editor.selection.getNode(),
			linkNode = editor.dom.getParent( selectedNode, 'a[href]' ),
			onlyText = this.hasSelectedText( linkNode ),
			nextState = {
				showDialog: true,
				isNew: true,
				newWindow: false,
				showLinkText: true,
				linkText: '',
				url: ''
			};

		if ( linkNode ) {
			nextState.linkText = linkNode.innerText || linkNode.textContent;
			nextState.url = editor.dom.getAttrib( linkNode, 'href' );
			nextState.newWindow = '_blank' === editor.dom.getAttrib( linkNode, 'target' );
			nextState.isNew = false;
		} else if ( onlyText ) {
			nextState.linkText = editor.selection.getContent( { format: 'text' } );
		}

		if ( ! linkNode ) {
			nextState.url = this.getInferredUrl() || '';
		}

		if ( ! this.hasSelectedText( linkNode ) ) {
			nextState.showLinkText = false;
		}

		return nextState;
	},

	closeDialog: function() {
		this.props.editor.focus();
		this.setState( { showDialog: false } );
	},

	setUrl: function( event ) {
		this.setState( { url: event.target.value } );
	},

	setLinkText: function( event ) {
		this.setState( { linkText: event.target.value } );
	},

	setNewWindow: function( event ) {
		this.setState( { newWindow: event.target.checked } );
	},

	onInputKeyDown: function( event ) {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			this.updateEditor();
		}
	},

	removeLink: function() {
		this.props.editor.execCommand( 'unlink' );
		this.closeDialog();
	},

	getButtons: function() {
		var buttonText, buttons;

		if ( this.state.isNew ) {
			buttonText = this.translate( 'Add Link' );
		} else {
			buttonText = this.translate( 'Save' );
		}

		buttons = [
			<FormButton
				key="save"
				onClick={ this.updateEditor }>
					{ buttonText }
			</FormButton>,
			<FormButton
				key="cancel"
				isPrimary={ false }
				onClick={ this.closeDialog }>
					{ this.translate( 'Cancel' ) }
			</FormButton>
		];

		if ( this.state.url && ! this.state.isNew ) {
			buttons.push(
				<button className={ 'wplink__remove-link' } onClick={ this.removeLink }>
					<Gridicon icon="link-break" />
					{ this.translate( 'Remove' ) }
				</button>
			);
		}

		return buttons;
	},

	render: function() {
		return (
			<Dialog
				isVisible={ this.state.showDialog }
				onClose={ this.closeDialog }
				buttons={ this.getButtons() }
				autoFocus={ false }
				additionalClassNames="wplink__dialog"
			>
				<FormFieldset>
					<FormLabel>
						<span>{ this.translate( 'URL' ) }</span>
						<FormTextInput
							ref="url"
							autoFocus={ true }
							onChange={ this.setUrl }
							value={ this.state.url }
							onKeyDown={ this.onInputKeyDown }
						/>
					</FormLabel>
					{ this.state.showLinkText ?
						<FormLabel>
							<span>{ this.translate( 'Link Text' ) }</span>
							<FormTextInput
								onChange={ this.setLinkText }
								value={ this.state.linkText }
								onKeyDown={ this.onInputKeyDown }
							/>
						</FormLabel>
					: null }
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<FormCheckbox onChange={ this.setNewWindow } checked={ this.state.newWindow } />
						<span>{ this.translate( 'Open link in a new window/tab' ) }</span>
					</FormLabel>
				</FormFieldset>
			</Dialog>
		);
	}
} );

module.exports = LinkDialog;
