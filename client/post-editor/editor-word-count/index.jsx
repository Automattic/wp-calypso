/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PostEditStore from 'lib/posts/post-edit-store';
import userModule from 'lib/user';
import { countWords } from 'lib/text-utils';

/**
 * Module variables
 */
const user = userModule();

const EditorWordCount = React.createClass( {
	propTypes: {
		selectedText: React.PropTypes.string
	},

	mixins: [ PureRenderMixin ],

	getInitialState() {
		return {
			rawContent: ''
		};
	},

	componentWillMount() {
		PostEditStore.on( 'rawContentChange', this.onRawContentChange );
	},

	componentDidMount() {
		this.onRawContentChange();
	},

	componentWillUnmount() {
		PostEditStore.removeListener( 'rawContentChange', this.onRawContentChange );
	},

	onRawContentChange() {
		this.setState( {
			rawContent: PostEditStore.getRawContent()
		} );
	},

	getSelectedTextCount() {
		const selectedText = textUtils.countWords( this.props.selectedText );

		if ( ! selectedText ) {
			return null;
		}

		return (
			this.props.translate(
				'%(selectedText)s word selected %(separator)s',
				'%(selectedText)s words selected %(separator)s',
				{
					count: selectedText,
					args: {
						selectedText: selectedText,
						separator: '/ ',
					},
				}
			)
		);
	},

	render() {
		const currentUser = user.get();
		const localeSlug = currentUser && currentUser.localeSlug || 'en';

		switch ( localeSlug ) {
			case 'ja':
			case 'th':
			case 'zh-cn':
			case 'zh-hk':
			case 'zh-sg':
			case 'zh-tw':
				// TODO these are character-based languages - count characters instead
				return null;

			case 'ko':
				// TODO Korean is not supported by our current word count regex
				return null;
		}

		const wordCount = textUtils.countWords( ( this.props.selectedText || this.state.rawContent ) );

		return (
			<div className="editor-word-count">
				<span className="editor-word-count__is-selected-text"><strong>{ this.getSelectedTextCount() }</strong></span>
				{ this.props.translate(
					'%d word',
					'%d words',
					{
						count: wordCount,
						args: [ wordCount ]
					}
				) }
			</div>
		);
	}
} );

export default localize( EditorWordCount );
