/**
 * External dependencies
 */
import classNames from 'classnames';
import { assign, noop, uniqueId } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import 'tinymce/plugins/lists/plugin.js';
import 'tinymce/themes/modern/theme.js';
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import i18n from 'components/tinymce/i18n';
import wplinkPlugin from 'components/tinymce/plugins/wplink/plugin';
import { wpautop } from 'lib/formatting';
import userFactory from 'lib/user';

class CompactTinyMCE extends Component {
	static contextTypes = {
		store: PropTypes.object,
	}

	static propTypes = {
		onContentsChange: PropTypes.func.isRequired,
		height: PropTypes.number,
		className: PropTypes.string,
		initialValue: PropTypes.string,
	}

	static defaultProps = {
		height: 250,
		className: '',
		initialValue: '',
		onContentsChange: noop,
	}

	// See this.localize()
	DUMMY_LANG_URL = '/do-not-load/';

	componentWillMount() {
		this._id = uniqueId( 'woocommerce-tinymce-' );
		// Init any plugins we need
		wplinkPlugin();
	}

	componentDidMount() {
		this.mounted = true;

		const setup = function( editor ) {
			this.editor = editor;

			if ( ! this.mounted ) {
				this.destroyEditor();
				return;
			}

			const { initialValue, onContentsChange } = this.props;
			editor.on( 'init', () => {
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
		}.bind( this );

		this.localize();
		const user = userFactory();

		tinymce.init( {
			selector: '#' + this._id,
			skin_url: '//s1.wp.com/wp-includes/js/tinymce/skins/lightgray',
			skin: 'lightgray',
			body_class: 'description',
			content_css: '/calypso/tinymce/skins/woocommerce/content.css',
			language: user.get() ? user.get().localeSlug : 'en',
			language_url: this.DUMMY_LANG_URL,
			directionality: user.isRTL() ? 'rtl' : 'ltr',
			relative_urls: false,
			remove_script_host: false,
			convert_urls: false,
			browser_spellcheck: true,
			fix_list_elements: true,
			keep_styles: false,
			textarea: this.refs.text,
			preview_styles: 'font-family font-size font-weight font-style text-decoration text-transform',
			end_container_on_empty_block: true,
			statusbar: false,
			resize: false,
			menubar: false,
			indent: false,
			plugins: 'lists,wplink',
			redux_store: this.context.store,
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
	}

	componentWillUnmount() {
		this.mounted = false;
		if ( this.editor ) {
			this.destroyEditor();
		}
	}

	destroyEditor() {
		tinymce.remove( this.editor );
		this.editor = null;
	}

	localize() {
		const user = userFactory();
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
		tinymce.ScriptLoader.markDone( this.DUMMY_LANG_URL );
	}

	render() {
		const tinyMCEClassName = classNames( 'tinymce' );
		const className = classNames( 'compact-tinymce', this.props.className );
		return (
			<div className={ className }>
				<textarea
					ref="text"
					className={ tinyMCEClassName }
					id={ this._id }
				/>
			</div>
		);
	}
}

export default CompactTinyMCE;
