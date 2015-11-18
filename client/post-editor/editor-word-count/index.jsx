/**
 * External dependencies
 */
import React from 'react/addons';

/**
 * Internal dependencies
 */
import PostEditStore from 'lib/posts/post-edit-store';
import userModule from 'lib/user';
import Count from 'components/count';
import textUtils from 'lib/text-utils';

/**
 * Module variables
 */
const user = userModule();

export default React.createClass( {
	displayName: 'EditorWordCount',

	mixins: [ React.addons.PureRenderMixin ],

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

		return (
			<div className="editor-word-count">
				{ this.translate( 'Word Count' ) }
				<Count count={ this.getCount() } />
			</div>
		);
	},

	getCount() {
		return textUtils.countWords( this.state.rawContent );
	}
} );
