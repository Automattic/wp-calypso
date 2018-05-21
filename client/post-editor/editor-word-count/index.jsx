/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PostEditStore from 'lib/posts/post-edit-store';
import { countWords } from 'lib/text-utils';
import { getCurrentUserLocale } from 'state/current-user/selectors';

export class EditorWordCount extends PureComponent {
	static propTypes = {
		selectedText: PropTypes.string,
		localeSlug: PropTypes.string,
	};

	state = {
		rawContent: '',
	};

	componentWillMount() {
		PostEditStore.on( 'rawContentChange', this.onRawContentChange );
	}

	componentDidMount() {
		this.onRawContentChange();
	}

	componentWillUnmount() {
		PostEditStore.removeListener( 'rawContentChange', this.onRawContentChange );
	}

	onRawContentChange = () => {
		this.setState( {
			rawContent: PostEditStore.getRawContent(),
		} );
	};

	getSelectedTextCount() {
		const selectedText = countWords( this.props.selectedText );

		if ( ! selectedText ) {
			return null;
		}

		return this.props.translate(
			'%(selectedText)s word selected {{span}}%(separator)s{{/span}}',
			'%(selectedText)s words selected {{span}}%(separator)s{{/span}}',
			{
				count: selectedText,
				args: {
					selectedText: selectedText,
					separator: '/ ',
				},
				components: {
					span: <span className="editor-word-count__separator" />,
				},
			}
		);
	}

	render() {
		switch ( this.props.localeSlug ) {
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
				<span className="editor-word-count__is-selected-text">
					<strong>{ this.getSelectedTextCount() }</strong>
				</span>
				{ this.props.translate( '%d word', '%d words', {
					count: wordCount,
					args: [ wordCount ],
				} ) }
			</div>
		);
	}
}

export default connect( state => ( {
	localeSlug: getCurrentUserLocale( state ) || 'en',
} ) )( localize( EditorWordCount ) );
