/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import { assign, forEach } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import autosize from 'autosize';
import tinymce from 'tinymce/tinymce';
import { ReactReduxContext } from 'react-redux';

import 'tinymce/themes/modern/theme.js';

// TinyMCE plugins
import 'tinymce/plugins/colorpicker/plugin.js';
import 'tinymce/plugins/directionality/plugin.js';
import 'tinymce/plugins/hr/plugin.js';
import 'tinymce/plugins/lists/plugin.js';
import 'tinymce/plugins/media/plugin.js';
import 'tinymce/plugins/paste/plugin.js';
import 'tinymce/plugins/tabfocus/plugin.js';
import 'tinymce/plugins/textcolor/plugin.js';

// TinyMCE plugins that we've forked or written ourselves
import wpcomPlugin from './plugins/wpcom/plugin.js';
import wpcomAutoresizePlugin from './plugins/wpcom-autoresize/plugin.js';
import wpcomHelpPlugin from './plugins/wpcom-help/plugin.js';
import wpcomCharmapPlugin from './plugins/wpcom-charmap/plugin.js';
import wpcomViewPlugin from './plugins/wpcom-view/plugin.js';
import wpcomSourcecode from './plugins/wpcom-sourcecode/plugin';
import wpeditimagePlugin from './plugins/wpeditimage/plugin.js';
import wplinkPlugin from './plugins/wplink/plugin.js';
import mediaPlugin from './plugins/media/plugin';
import advancedPlugin from './plugins/advanced/plugin';
import wpcomTabindexPlugin from './plugins/wpcom-tabindex/plugin';
import wpcomTrackPaste from './plugins/wpcom-track-paste/plugin';
import touchScrollToolbarPlugin from './plugins/touch-scroll-toolbar/plugin';
import editorButtonAnalyticsPlugin from './plugins/editor-button-analytics/plugin';
import calypsoAlertPlugin from './plugins/calypso-alert/plugin';
import contactFormPlugin from './plugins/contact-form/plugin';
import simplePaymentsPlugin from './plugins/simple-payments/plugin';
import afterTheDeadlinePlugin from './plugins/after-the-deadline/plugin';
import wptextpatternPlugin from './plugins/wptextpattern/plugin';
import toolbarPinPlugin from './plugins/toolbar-pin/plugin';
import insertMenuPlugin from './plugins/insert-menu/plugin';
import embedPlugin from './plugins/embed/plugin';
import embedReversalPlugin from './plugins/embed-reversal/plugin';
import EditorHtmlToolbar from 'post-editor/editor-html-toolbar';
import mentionsPlugin from './plugins/mentions/plugin';
import markdownPlugin from './plugins/markdown/plugin';
import wpEmojiPlugin from './plugins/wpemoji/plugin';

[
	wpcomPlugin,
	wpcomAutoresizePlugin,
	wpcomHelpPlugin,
	wpcomCharmapPlugin,
	wpcomViewPlugin,
	wpcomSourcecode,
	wpeditimagePlugin,
	wplinkPlugin,
	insertMenuPlugin,
	mediaPlugin,
	advancedPlugin,
	wpcomTabindexPlugin,
	wpcomTrackPaste,
	touchScrollToolbarPlugin,
	editorButtonAnalyticsPlugin,
	calypsoAlertPlugin,
	contactFormPlugin,
	afterTheDeadlinePlugin,
	wptextpatternPlugin,
	toolbarPinPlugin,
	embedPlugin,
	embedReversalPlugin,
	markdownPlugin,
	wpEmojiPlugin,
	simplePaymentsPlugin,
].forEach( ( initializePlugin ) => initializePlugin() );

/**
 * Internal Dependencies
 */
import i18n from './i18n';
import config from 'config';
import { decodeEntities, wpautop, removep } from 'lib/formatting';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import { getPreference } from 'state/preferences/selectors';
import { isLocaleRtl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Internal Variables
 */
let _instance = 1;

const DUMMY_LANG_URL = '/do-not-load/';

const EVENTS = {
	activate: 'onActivate',
	blur: 'onBlur',
	change: 'onChange',
	click: 'onClick',
	input: 'onInput',
	keyUp: 'onKeyUp',
	deactivate: 'onDeactivate',
	focus: 'onFocus',
	hide: 'onHide',
	init: 'onInit',
	mouseUp: 'onMouseUp',
	redo: 'onRedo',
	remove: 'onRemove',
	reset: 'onReset',
	show: 'onShow',
	submit: 'onSubmit',
	undo: 'onUndo',
	setContent: 'onSetContent',
};

const PLUGINS = [
	'colorpicker',
	'embed',
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
	'AtD',
	'directionality',
	'wpemoji',
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
	'wpcom/toolbarpin',
	'wpcom/contactform',
	'wpcom/sourcecode',
	'wpcom/embedreversal',
	'wpcom/trackpaste',
	'wpcom/insertmenu',
	'wpcom/markdown',
	'wpcom/simplepayments',
];

mentionsPlugin();
PLUGINS.push( 'wpcom/mentions' );

const CONTENT_CSS = [
	window.app.staticUrls[ 'tinymce/skins/wordpress/wp-content.css' ],
	'//s1.wp.com/wp-includes/css/dashicons.css?v=20150727',
	window.app.staticUrls[ 'editor.css' ],
	'https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese&display=swap',
];

export default class TinyMCE extends React.Component {
	static propTypes = {
		isNew: PropTypes.bool,
		mode: PropTypes.string,
		tabIndex: PropTypes.number,
		onActivate: PropTypes.func,
		onBlur: PropTypes.func,
		onChange: PropTypes.func,
		onClick: PropTypes.func,
		onDeactivate: PropTypes.func,
		onFocus: PropTypes.func,
		onHide: PropTypes.func,
		onInit: PropTypes.func,
		onInput: PropTypes.func,
		onKeyUp: PropTypes.func,
		onMouseUp: PropTypes.func,
		onRedo: PropTypes.func,
		onRemove: PropTypes.func,
		onReset: PropTypes.func,
		onShow: PropTypes.func,
		onSubmit: PropTypes.func,
		onSetContent: PropTypes.func,
		onUndo: PropTypes.func,
		onTextEditorChange: PropTypes.func,
		isGutenbergClassicBlock: PropTypes.bool,
		isVipSite: PropTypes.bool,
	};

	static defaultProps = {
		mode: 'tinymce',
		isNew: false,
		isGutenbergClassicBlock: false,
	};

	state = {
		content: '',
		selection: null,
	};

	reduxStore = null;

	_editor = null;

	_id = 'tinymce-' + _instance++;

	textInput = React.createRef();

	componentDidUpdate( prevProps ) {
		if ( ! this._editor ) {
			return;
		}

		this.bindEditorEvents( prevProps );

		if ( this.props.mode !== prevProps.mode ) {
			this.toggleEditor();
		}
	}

	componentDidMount() {
		const { isGutenbergClassicBlock, isVipSite } = this.props;
		this.mounted = true;

		const setup = ( editor ) => {
			this._editor = editor;

			if ( ! this.mounted ) {
				this.destroyEditor();
				return;
			}

			this.bindEditorEvents();
			editor.on( 'SetTextAreaContent', ( event ) => this.setTextAreaContent( event.content ) );
			editor.once(
				'PostRender',
				this.toggleEditor.bind( this, { autofocus: ! this.props.isNew } )
			);
		};

		const store = this.reduxStore;
		let isRtl = false;
		let localeSlug = 'en';
		let colorScheme = undefined;

		if ( store ) {
			const state = store.getState();

			localeSlug = getCurrentLocaleSlug( state );
			isRtl = isLocaleRtl( localeSlug );
			colorScheme = getPreference( state, 'colorScheme' );
		}

		this.localize( isRtl, localeSlug );

		const ltrButton = isRtl ? 'ltr,' : '';
		const gutenbergClassName = isGutenbergClassicBlock ? ' is-gutenberg' : '';
		const spellchecker = isVipSite ? ',spellchecker' : '';

		tinymce.init( {
			selector: '#' + this._id,
			skin_url: '/calypso/tinymce/skins/lightgray',
			skin: 'lightgray',
			content_css: CONTENT_CSS,
			language: localeSlug,
			language_url: DUMMY_LANG_URL,
			directionality: isRtl ? 'rtl' : 'ltr',
			formats: {
				alignleft: [
					{
						selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
						styles: { textAlign: 'left' },
					},
					{
						selector: 'img,table,dl.wp-caption',
						classes: 'alignleft',
					},
				],
				aligncenter: [
					{
						selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
						styles: { textAlign: 'center' },
					},
					{
						selector: 'img,table,dl.wp-caption',
						classes: 'aligncenter',
					},
				],
				alignright: [
					{
						selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
						styles: { textAlign: 'right' },
					},
					{
						selector: 'img,table,dl.wp-caption',
						classes: 'alignright',
					},
				],
				strikethrough: { inline: 'del' },
			},
			relative_urls: false,
			remove_script_host: false,
			convert_urls: false,
			branding: false,
			browser_spellcheck: true,
			fix_list_elements: true,
			entities: '38,amp,60,lt,62,gt',
			entity_encoding: 'raw',
			keep_styles: false,
			wpeditimage_html5_captions: true,
			redux_store: store,
			textarea: this.textInput.current,

			// Limit the preview styles in the menu/toolbar
			preview_styles: 'font-family font-size font-weight font-style text-decoration text-transform',
			end_container_on_empty_block: true,
			plugins: PLUGINS.join(),
			statusbar: false,
			resize: false,
			menubar: false,
			indent: false,

			// AfterTheDeadline Configuration
			atd_rpc_id: 'https://wordpress.com',
			atd_ignore_enable: true,

			// Try to find a suitable minimum size based on the viewport height
			// minus the surrounding editor chrome to avoid scrollbars. In the
			// future, we should calculate from the rendered editor bounds.
			autoresize_min_height: isGutenbergClassicBlock
				? 150
				: Math.max( document.documentElement.clientHeight - 300, 300 ),
			autoresize_bottom_margin: isGutenbergClassicBlock || isMobile() ? 10 : 50,

			toolbar1: `wpcom_insert_menu,formatselect,bold,italic,bullist,numlist,link,blockquote,alignleft,aligncenter,alignright${ spellchecker },wp_more,${ ltrButton }wpcom_advanced`,
			toolbar2:
				'strikethrough,underline,hr,alignjustify,forecolor,pastetext,removeformat,wp_charmap,outdent,indent,undo,redo,wp_help',
			toolbar3: '',
			toolbar4: '',

			tabfocus_elements: 'content-html,save-post',
			tabindex: this.props.tabIndex,
			body_class: `content post-type-post post-status-draft post-format-standard locale-en-us${ gutenbergClassName }`,
			add_unload_trigger: false,

			color_scheme: colorScheme,

			setup: setup,
		} );

		autosize( this.textInput.current );
	}

	componentWillUnmount() {
		this.mounted = false;
		if ( this._editor ) {
			this.destroyEditor();
		}
	}

	destroyEditor = () => {
		forEach(
			EVENTS,
			function ( eventHandler, eventName ) {
				if ( this.props[ eventHandler ] ) {
					this._editor.off( eventName, this.props[ eventHandler ] );
				}
			}.bind( this )
		);

		tinymce.remove( this._editor );
		this._editor = null;
		autosize.destroy( this.textInput.current );
	};

	doAutosizeUpdate = () => {
		autosize.update( this.textInput.current );
	};

	bindEditorEvents = ( prevProps ) => {
		prevProps = prevProps || {};

		forEach(
			EVENTS,
			function ( eventHandler, eventName ) {
				if ( prevProps[ eventHandler ] !== this.props[ eventHandler ] ) {
					if ( this.props[ eventHandler ] ) {
						this._editor.on( eventName, this.props[ eventHandler ] );
					} else {
						this._editor.off( eventName, this.props[ eventHandler ] );
					}
				}
			}.bind( this )
		);
	};

	toggleEditor = ( options = { autofocus: true } ) => {
		if ( ! this._editor ) {
			return;
		}

		if ( this.props.mode === 'html' ) {
			this._editor.hide();
			this.doAutosizeUpdate();
			if ( options.autofocus ) {
				this.focusEditor();
			}
			return;
		}

		this._editor.show();
		if ( options.autofocus ) {
			this.focusEditor();
		}
	};

	focusEditor = () => {
		if ( this.props.mode === 'html' ) {
			const textNode = this.textInput.current;

			// Collapse selection to avoid scrolling to the bottom of the textarea
			if ( this.state.selection ) {
				this.selectTextInTextArea( this.state.selection );
			} else {
				textNode.setSelectionRange( 0, 0 );
			}

			// Browser is not Internet Explorer 11
			if ( 11 !== tinymce.Env.ie ) {
				textNode.focus();
			}
		} else if ( this._editor ) {
			this._editor.focus();
		}
	};

	getContent = ( args ) => {
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

			content = removep( content );
		}

		return content;
	};

	isDirty = () => {
		if ( this._editor ) {
			return this._editor.isDirty();
		}
		return false;
	};

	setTextAreaContent = ( content ) => {
		this.setState(
			{
				content: decodeEntities( content ),
			},
			this.doAutosizeUpdate
		);
	};

	setEditorContent = ( content, args = {} ) => {
		if ( this._editor ) {
			const { mode } = this.props;
			this._editor.setContent( wpautop( content ), { ...args, mode } );
			if ( args.initial ) {
				// Clear the undo stack when initially setting content
				this._editor.undoManager.clear();
			}
		}

		this.setTextAreaContent( content );
	};

	setSelection = ( selection ) => {
		this.setState( {
			selection,
		} );
	};

	selectTextInTextArea = ( selection ) => {
		// only valid in the text area mode and if we have selection
		if ( ! selection ) {
			return;
		}

		const textNode = this.textInput.current;

		const start = selection.start;
		const end = selection.end || selection.start;
		// Collapse selection to avoid scrolling to the bottom of the textarea
		textNode.setSelectionRange( start, end );

		// clear out the selection from the state
		this.setState( { selection: null } );
	};

	onTextAreaChange = ( event ) => {
		const content = event.target.value;

		if ( this.props.onTextEditorChange ) {
			this.props.onTextEditorChange( content );
		}

		this.setState( { content: content }, this.doAutosizeUpdate );
	};

	onToolbarChangeContent = ( content ) => {
		if ( this.props.onTextEditorChange ) {
			this.props.onTextEditorChange( content );
		}

		this.setState( { content }, this.doAutosizeUpdate );
	};

	localize = ( isRtl, localeSlug ) => {
		let i18nStrings = i18n;

		if ( isRtl ) {
			i18nStrings = assign( { _dir: 'rtl' }, i18nStrings );
		}

		tinymce.addI18n( localeSlug, i18nStrings );

		// Stop TinyMCE from trying to load the lang script by marking as done
		tinymce.ScriptLoader.markDone( DUMMY_LANG_URL );
	};

	renderEditor() {
		const { mode } = this.props;
		const className = classnames( {
			tinymce: true,
			'is-visible': mode === 'html',
		} );

		/*
		 * Using `classnames()` here is partly a hack to avoid the linter complaining that the
		 * container is named `tinymce-container` instead of `tinymce`. Ideally the containing
		 * `div` and the `textarea` should be refactored so that the `div` has the `tinymce`
		 * class, but that would interfere with higher priority fixes. This component is slated
		 * for some refactoring in the near future, so that will be a more convenient time to
		 * clean this up.
		 */
		const containerClassName = classnames( 'tinymce-container', 'editor-mode-' + mode );

		return (
			<div className={ containerClassName }>
				{ 'html' === mode && config.isEnabled( 'post-editor/html-toolbar' ) && (
					<EditorHtmlToolbar
						content={ this.textInput.current }
						onToolbarChangeContent={ this.onToolbarChangeContent }
					/>
				) }
				<textarea
					ref={ this.textInput }
					className={ className }
					id={ this._id }
					onChange={ this.onTextAreaChange }
					tabIndex={ this.props.tabIndex }
					value={ this.state.content }
				/>
			</div>
		);
	}

	render() {
		return (
			<ReactReduxContext.Consumer>
				{ ( { store } ) => {
					this.reduxStore = store;
					return this.renderEditor();
				} }
			</ReactReduxContext.Consumer>
		);
	}
}
