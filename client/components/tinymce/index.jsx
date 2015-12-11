/**
 * External Dependencies
 */
const React = require( 'react' ),
	classnames = require( 'classnames' ),
	autosize = require( 'autosize' ),
	forEach = require( 'lodash/collection/forEach' ),
	assign = require( 'lodash/object/assign' ),
	tinymce = require( 'tinymce/tinymce' );

require( 'tinymce/themes/modern/theme.js' );

// TinyMCE plugins
require( 'tinymce/plugins/colorpicker/plugin.js' );
require( 'tinymce/plugins/hr/plugin.js' );
require( 'tinymce/plugins/lists/plugin.js' );
require( 'tinymce/plugins/media/plugin.js' );
require( 'tinymce/plugins/paste/plugin.js' );
require( 'tinymce/plugins/tabfocus/plugin.js' );
require( 'tinymce/plugins/textcolor/plugin.js' );

// TinyMCE plugins copied from .org
require( './plugins/wptextpattern/plugin.js' );

// TinyMCE plugins that we've forked or written ourselves
require( './plugins/wpcom/plugin.js' )();
require( './plugins/wpcom-autoresize/plugin.js' )();
require( './plugins/wpcom-help/plugin.js' )();
require( './plugins/wpcom-charmap/plugin.js' )();
require( './plugins/wpcom-view/plugin.js' )();
require( './plugins/wpeditimage/plugin.js' )();
require( './plugins/wplink/plugin.js' )();
require( './plugins/media/plugin' )();
require( './plugins/advanced/plugin' )();
require( './plugins/wpcom-tabindex/plugin' )();
require( './plugins/touch-scroll-toolbar/plugin' )();
require( './plugins/editor-button-analytics/plugin' )();
require( './plugins/calypso-alert/plugin' )();
require( './plugins/contact-form/plugin' )();

/**
 * Internal Dependencies
 */
const formatting = require( 'lib/formatting' ),
	user = require( 'lib/user' )(),
	i18n = require( './i18n' ),
	viewport = require( 'lib/viewport' ),
	config = require( 'config' );

/**
 * Internal Variables
 */
let _instance = 1;

const DUMMY_LANG_URL = '/do-not-load/';

const EVENTS = {
	activate: 'onActivate',
	blur: 'onBlur',
	change: 'onChange',
	input: 'onInput',
	keyUp: 'onKeyUp',
	deactivate: 'onDeactivate',
	focus: 'onFocus',
	hide: 'onHide',
	init: 'onInit',
	redo: 'onRedo',
	remove: 'onRemove',
	reset: 'onReset',
	show: 'onShow',
	submit: 'onSubmit',
	undo: 'onUndo',
	setContent: 'onSetContent'
};

const PLUGINS = [
	'colorpicker',
	'hr',
	'lists',
	'media',
	'paste',
	'tabfocus',
	'textcolor',
	'wptextpattern',
	'wpcom',
	'wpeditimage',
	'wplink',
	'wpcom/autoresize',
	'wpcom/media',
	'wpcom/advanced',
	'wpcom/help',
	'wpcom/charmap',
	'wpcom/tabindex',
	'wpcom/touchscrolltoolbar',
	'wpcom/view',
	'wpcom/editorbuttonanalytics',
	'wpcom/calypsoalert',
	'wpcom/tabindex',
	'wpcom/contactform'
];

const CONTENT_CSS = [
	window.app.tinymceWpSkin,
	'//s1.wp.com/wp-includes/css/dashicons.css',
	window.app.tinymceEditorCss,
	'//fonts.googleapis.com/css?family=Merriweather:700%2C400%2C700italic%2C400italic',
];

module.exports = React.createClass( {
	displayName: 'TinyMCE',

	propTypes: {
		mode: React.PropTypes.string,
		onActivate: React.PropTypes.func,
		onBlur: React.PropTypes.func,
		onChange: React.PropTypes.func,
		onDeactivate: React.PropTypes.func,
		onFocus: React.PropTypes.func,
		onHide: React.PropTypes.func,
		onInit: React.PropTypes.func,
		onRedo: React.PropTypes.func,
		onRemove: React.PropTypes.func,
		onReset: React.PropTypes.func,
		onShow: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		onUndo: React.PropTypes.func,
		onSetContent: React.PropTypes.func,
		tabIndex: React.PropTypes.number,
		isNew: React.PropTypes.bool,
		onTextEditorChange: React.PropTypes.func,
		onKeyUp: React.PropTypes.func,
		onTogglePin: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			mode: 'tinymce',
			isNew: false
		};
	},

	getInitialState: function() {
		return {
			content: ''
		};
	},

	_editor: null,

	_pinned: false,

	componentWillMount: function() {
		this._id = 'tinymce-' + _instance;
		_instance++;
	},

	componentDidUpdate: function( prevProps ) {
		if ( ! this._editor ) {
			return;
		}

		this.bindEditorEvents( prevProps );

		if ( this.props.mode !== prevProps.mode ) {
			this.toggleEditor();
		}
	},

	componentDidMount: function() {
		const setup = function( editor ) {
			this._editor = editor;
			this.bindEditorEvents();
			editor.on( 'SetTextAreaContent', ( event ) => this.setTextAreaContent( event.content ) );

			window.addEventListener( 'scroll', this.onScrollPinTools );
			if ( ! viewport.isMobile() ) {
				editor.once( 'PostRender', this.toggleEditor.bind( this, { autofocus: ! this.props.isNew } ) );
			}
		}.bind( this );

		this.localize();

		let toolbar1 = [ 'wpcom_add_media', 'formatselect', 'bold', 'italic', 'bullist', 'numlist', 'link', 'blockquote', 'alignleft', 'aligncenter', 'alignright', 'spellchecker', 'wp_more', 'wpcom_advanced' ];
		if ( config.isEnabled( 'post-editor/contact-form' ) ) {
			toolbar1.splice( 1, 0, 'wpcom_add_contact_form' );
		}

		tinymce.init( {
			selector: '#' + this._id,
			skin_url: '//s1.wp.com/wp-includes/js/tinymce/skins/lightgray',
			skin: 'lightgray',
			content_css: CONTENT_CSS.join( ',' ),
			language: user.get() ? user.get().localeSlug : 'en',
			language_url: DUMMY_LANG_URL,
			directionality: user.isRTL() ? 'rtl' : 'ltr',
			formats: {
				alignleft: [
					{
						selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
						styles: { textAlign: 'left' }
					},
					{
						selector: 'img,table,dl.wp-caption',
						classes: 'alignleft'
					}
				],
				aligncenter: [
					{
						selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
						styles: { textAlign: 'center' }
					},
					{
						selector: 'img,table,dl.wp-caption',
						classes: 'aligncenter'
					}
				],
				alignright: [
					{
						selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
						styles: { textAlign: 'right' }
					},
					{
						selector: 'img,table,dl.wp-caption',
						classes: 'alignright'
					}
				],
				strikethrough: { inline: 'del' }
			},
			relative_urls: false,
			remove_script_host: false,
			convert_urls: false,
			browser_spellcheck: true,
			fix_list_elements: true,
			entities: '38,amp,60,lt,62,gt',
			entity_encoding: 'raw',
			keep_styles: false,
			wpeditimage_html5_captions: true,

			// Limit the preview styles in the menu/toolbar
			preview_styles: 'font-family font-size font-weight font-style text-decoration text-transform',
			end_container_on_empty_block: true,
			plugins: PLUGINS.join(),
			statusbar: false,
			resize: false,
			menubar: false,
			indent: false,

			autoresize_min_height: document.documentElement.clientHeight,
			toolbar1: toolbar1.join(),
			toolbar2: 'strikethrough,underline,hr,alignjustify,forecolor,pastetext,removeformat,wp_charmap,outdent,indent,undo,redo,wp_help',
			toolbar3: '',
			toolbar4: '',

			tabfocus_elements: 'content-html,save-post',
			tabindex: this.props.tabIndex,
			body_class: 'content post-type-post post-status-draft post-format-standard locale-en-us',
			add_unload_trigger: false,

			setup: setup

		} );

		autosize( React.findDOMNode( this.refs.text ) );
	},

	componentWillUnmount: function() {
		forEach( EVENTS, function( eventHandler, eventName ) {
			if ( this.props[ eventHandler ] ) {
				this._editor.off( eventName, this.props[ eventHandler ] );
			}
		}, this );

		window.removeEventListener( 'scroll', this.onScrollPinTools );
		tinymce.remove( this._editor );
		this._editor = null;
		autosize.destroy( React.findDOMNode( this.refs.text ) );
	},

	doAutosizeUpdate: function() {
		autosize.update( React.findDOMNode( this.refs.text ) );
	},

	bindEditorEvents: function( prevProps ) {
		prevProps = prevProps || {};

		forEach( EVENTS, function( eventHandler, eventName ) {
			if ( prevProps[ eventHandler ] !== this.props[ eventHandler ] ) {
				if ( this.props[ eventHandler ] ) {
					this._editor.on( eventName, this.props[ eventHandler ] );
				} else {
					this._editor.off( eventName, this.props[ eventHandler ] );
				}
			}
		}, this );
	},

	onScrollPinTools: function() {
		const editor = this._editor,
			$ = editor.$;

		if ( ! editor || this.props.mode === 'html' ) {
			return;
		}

		const container = editor.getContainer();
		const rect = container.getBoundingClientRect();

		if ( rect.top < 46 && ! this._pinned && viewport.isWithinBreakpoint( '>660px' ) ) {
			this._pinned = true;
			const toolbar = $( '.mce-toolbar-grp:not(.mce-inline-toolbar-grp)', container ).first();
			const toolbarComputedStyle = window.getComputedStyle( toolbar[ 0 ] );
			const toolbarWidth = toolbar[ 0 ].parentNode.clientWidth - parseInt( toolbarComputedStyle.marginLeft, 10 ) - parseInt( toolbarComputedStyle.marginRight, 10 );

			toolbar.css( {
				boxSizing: 'border-box',
				position: 'fixed',
				top: '46px',
				left: 'auto',
				right: 'auto',
				width: toolbarWidth + 'px',
				'z-index': 20
			} );

			if ( this.props.onTogglePin ) {
				this.props.onTogglePin( 'pin' );
			}
		} else if ( window.pageYOffset < 164 && this._pinned ) {
			this._pinned = false;
			$( '.mce-toolbar-grp:not(.mce-inline-toolbar-grp)', container ).first().css( {
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				width: 'auto',
				'z-index': 'auto'
			} );
			if ( this.props.onTogglePin ) {
				this.props.onTogglePin( 'unpin' );
			}
		}
	},

	toggleEditor: function( options = { autofocus: true } ) {
		if ( ! this._editor ) {
			return;
		}

		if ( this.props.mode === 'html' ) {
			this._editor.hide();
			this.doAutosizeUpdate();
			if ( options.autofocus ) {
				this.focusEditor( );
			}
			return;
		}

		this._editor.show();
		if ( options.autofocus ) {
			this.focusEditor();
		}
	},

	focusEditor: function() {
		if ( this.props.mode === 'html' ) {
			const textNode = React.findDOMNode( this.refs.text );

			// Collapse selection to avoid scrolling to the bottom of the textarea
			textNode.setSelectionRange( 0, 0 );
			textNode.focus();
		} else if ( this._editor ) {
			this._editor.focus();
		}
	},

	getContent: function( args ) {
		if ( this.props.mode === 'html' ) {
			return this.state.content;
		}

		if ( ! this._editor ) {
			return '';
		}

		let content = this._editor.getContent( args );

		if ( ! args || 'raw' !== args.format ) {
			// TODO: fix code duplication between the wordpress plugin and the React component
			content = content.replace( /<p>(?:<br ?\/?>|\u00a0|\uFEFF| )*<\/p>/g, '<p>&nbsp;</p>' );

			content = formatting.removep( content );
		}

		return content;
	},

	isDirty: function() {
		if ( this._editor ) {
			return this._editor.isDirty();
		}
		return false;
	},

	setTextAreaContent: function( content ) {
		this.setState( { content }, this.doAutosizeUpdate );
	},

	setEditorContent: function( content ) {
		if ( this._editor ) {
			this._editor.setContent( formatting.wpautop( content ) );

			// clear the undo stack to ensure that we don't have any leftovers
			this._editor.undoManager.clear();
		}

		this.setTextAreaContent( content );
	},

	onTextAreaChange: function( event ) {
		const content = event.target.value;

		if ( this.props.onTextEditorChange ) {
			this.props.onTextEditorChange( content );
		}

		this.setState( { content: content }, this.doAutosizeUpdate );
	},

	localize: function() {
		const userData = user.get();
		let i18nStrings = i18n;

		if ( ! userData ) {
			return;
		}

		if ( user.isRTL() ) {
			i18nStrings = assign( { _dir: 'rtl' }, i18nStrings );
		}

		tinymce.addI18n( userData.localeSlug, i18nStrings );

		// Stop TinyMCE from trying to load the lang script by marking as done
		tinymce.ScriptLoader.markDone( DUMMY_LANG_URL );
	},

	render: function() {
		const className = classnames( {
			tinymce: true,
			'is-visible': this.props.mode === 'html'
		} );

		return (
			<textarea
				ref="text"
				className={ className }
				id={ this._id }
				onChange={ this.onTextAreaChange }
				tabIndex={ this.props.tabIndex }
				value={ this.state.content }
			/>
		);
	}
} );
