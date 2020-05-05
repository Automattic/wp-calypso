/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { assign, noop, uniqueId, forEach } from 'lodash';
import classNames from 'classnames';
import { ReactReduxContext } from 'react-redux';

import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/modern/theme.js';
import 'tinymce/plugins/lists/plugin.js';
/**
 * Internal dependencies
 */
import i18n from 'components/tinymce/i18n';
import { wpautop } from 'lib/formatting';
// TinyMCE plugins & dependencies
import wplinkPlugin from 'components/tinymce/plugins/wplink/plugin';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import { isLocaleRtl } from 'lib/i18n-utils';

class CompactTinyMCE extends Component {
	static propTypes = {
		onContentsChange: PropTypes.func.isRequired,
		height: PropTypes.number,
		className: PropTypes.string,
		initialValue: PropTypes.string,
	};

	static defaultProps = {
		height: 250,
		className: '',
		initialValue: '',
		onContentsChange: noop,
	};

	reduxStore = null;

	// See this.localize()
	DUMMY_LANG_URL = '/do-not-load/';

	UNSAFE_componentWillMount() {
		this._id = uniqueId( 'woocommerce-tinymce-' );
		// Init any plugins we need
		wplinkPlugin();
	}

	componentDidMount() {
		this.mounted = true;

		const setup = ( editor ) => {
			this.editor = editor;

			if ( ! this.mounted ) {
				this.destroyEditor();
				return;
			}

			const { initialValue, onContentsChange } = this.props;

			editor.on( 'init', () => {
				this.editorContainer = this.editor.getContainer();
				this.editor.setContent( wpautop( initialValue ) );
			} );

			if ( onContentsChange ) {
				editor.on( 'change', () => {
					onContentsChange( this.editor.getContent() );
				} );
				editor.on( 'keyup', () => {
					onContentsChange( this.editor.getContent() );
				} );
			}
		};

		const store = this.reduxStore;
		let isRtl = false;
		let localeSlug = 'en';

		if ( store ) {
			const state = store.getState();

			localeSlug = getCurrentLocaleSlug( state );
			isRtl = isLocaleRtl( localeSlug );
		}

		this.localize( isRtl, localeSlug );

		tinymce.init( {
			selector: '#' + this._id,
			skin_url: '/calypso/tinymce/skins/lightgray',
			skin: 'lightgray',
			body_class: 'description',
			content_css: '/calypso/tinymce/skins/woocommerce/content.css',
			language: localeSlug,
			language_url: this.DUMMY_LANG_URL,
			directionality: isRtl ? 'rtl' : 'ltr',
			relative_urls: false,
			remove_script_host: false,
			convert_urls: false,
			browser_spellcheck: true,
			fix_list_elements: true,
			keep_styles: false,
			textarea: this.textarea,
			preview_styles: 'font-family font-size font-weight font-style text-decoration text-transform',
			end_container_on_empty_block: true,
			statusbar: false,
			resize: false,
			menubar: false,
			indent: false,
			plugins: 'lists,wplink',
			redux_store: store,
			height: this.props.height + 'px',
			toolbar1: 'formatselect,bold,italic,bullist,numlist,link,blockquote',
			toolbar2: '',
			toolbar3: '',
			toolbar4: '',
			branding: false,
			add_unload_trigger: false,
			setup: setup,
		} );

		// TODO Investigate if there is a better way to do this in the future.
		// The post editor adds a bunch of CSS rules that affect TinyMCE, in root components.
		// To avoid making changes that affect the post editor at this time, we can load a small set of CSS.
		// This mainly affects the text format drop down which renders outside of any elements that we can target.
		tinymce.DOM.loadCSS( '/calypso/tinymce/skins/woocommerce/editor.css' );
		tinymce.DOM.loadCSS( '//s1.wp.com/wp-includes/css/dashicons.css?v=20150727' );
	}

	componentWillUnmount() {
		this.mounted = false;
		this.destroyEditor();
	}

	destroyEditor() {
		if ( this.editor ) {
			forEach( [ 'change', 'keyup', 'setcontent', 'init' ], ( eventName ) => {
				this.editor.off( eventName );
			} );
		}

		this.editorContainer && tinymce.remove( this.editorContainer );
		this.editor = null;
		this.editorContainer = null;
	}

	setTextAreaRef = ( ref ) => {
		this.textarea = ref;
	};

	localize( isRtl, localeSlug ) {
		let i18nStrings = i18n;

		if ( isRtl ) {
			i18nStrings = assign( { _dir: 'rtl' }, i18nStrings );
		}

		tinymce.addI18n( localeSlug, i18nStrings );

		// Stop TinyMCE from trying to load the lang script by marking as done
		tinymce.ScriptLoader.markDone( this.DUMMY_LANG_URL );
	}

	renderEditor() {
		const tinyMCEClassName = classNames( 'tinymce' );
		const className = classNames( 'compact-tinymce', this.props.className );
		return (
			<div className={ className }>
				<textarea ref={ this.setTextAreaRef } className={ tinyMCEClassName } id={ this._id } />
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

export default CompactTinyMCE;
