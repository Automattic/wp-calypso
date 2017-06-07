/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { assign, uniqueId, noop } from 'lodash';
import classNames from 'classnames';
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import i18n from 'components/tinymce/i18n';
import userFactory from 'lib/user';
import { wpautop } from 'lib/formatting';
// TinyMCE plugins & dependencies
import wplinkPlugin from 'components/tinymce/plugins/wplink/plugin';
import 'tinymce/themes/modern/theme.js';
import 'tinymce/plugins/lists/plugin.js';

class CompactTinyMCE extends Component {
	static contextTypes = {
		store: PropTypes.object,
	}

	static propTypes = {
		height: PropTypes.number,
		className: PropTypes.string,
		value: PropTypes.string,
		onContentsChange: PropTypes.func,
	}

	static defaultProps = {
		height: 250,
		className: '',
		value: '',
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
			this._editor = editor;

			if ( ! this.mounted ) {
				this.destroyEditor();
				return;
			}

			const { value, onContentsChange } = this.props;
			editor.on( 'init', () => {
				this._editor.setContent( wpautop( value ) );
			} );
			if ( onContentsChange ) {
				editor.on( 'change', () => {
					onContentsChange( this._editor.getContent() );
				} );
				editor.on( 'keyup', () => {
					onContentsChange( this._editor.getContent() );
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
		tinymce.DOM.loadCSS( '/calypso/tinymce/skins/woocommerce/editor.css' );
	}

	componentWillUnmount() {
		this.mounted = false;
		if ( this._editor ) {
			this.destroyEditor();
		}
	}

	destroyEditor() {
		tinymce.remove( this._editor );
		this._editor = null;
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
