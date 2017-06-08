/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

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

export default React.createClass( {
	displayName: 'EditorWordCount',

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

		const wordCount = countWords( this.state.rawContent );

		return (
			<div className="editor-word-count">
				{ this.translate(
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
