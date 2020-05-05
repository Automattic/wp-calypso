/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { countWords } from 'lib/text-utils';
import { getCurrentUserLocale } from 'state/current-user/selectors';
import { getEditorRawContent } from 'state/ui/editor/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class EditorWordCount extends Component {
	static propTypes = {
		selectedText: PropTypes.string,
		rawContent: PropTypes.string,
		localeSlug: PropTypes.string,
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
					selectedText,
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

		const wordCount = countWords( this.props.rawContent );

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

export default connect( ( state ) => ( {
	localeSlug: getCurrentUserLocale( state ) || 'en',
	rawContent: getEditorRawContent( state ),
} ) )( localize( EditorWordCount ) );
