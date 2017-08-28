/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import AutoDirection from 'components/auto-direction';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { truncate, includes, startsWith, some } from 'lodash';

/**
 * Internal Dependencies
 */
import withDimensions from 'lib/with-dimensions';

class PostCommentContent extends React.Component {
	static propTypes = {
		content: PropTypes.string.isRequired,
		isPlaceholder: PropTypes.bool,
		className: PropTypes.string,
		onMoreClicked: PropTypes.func,
		hideMore: PropTypes.bool,
	};

	render() {
		const { hideMore } = this.props;
		let { content } = this.props;
		// Don't trust comment content unless it was provided by the API
		if ( this.props.isPlaceholder ) {
			return (
				<div className={ classNames( 'comments__comment-content', this.props.className ) }>
					{ this.props.content.split( '\n' ).map( ( item, key ) => {
						return (
							<span key={ key }>
								{ item }
								<br />
							</span>
						);
					} ) }
				</div>
			);
		}

		const idealNumLines = this.props.className === 'is-single-line' ? 1 : 3;
		const charactersPerPixel = 0.11;
		const charactersPerLine = charactersPerPixel * this.props.width; // avg chars per line
		const charsToDisplay = charactersPerLine * idealNumLines;
		let charsSoFar = 0;
		let actualCharIndex = content.length;
		const newLines = [ '<br>', '<br/>', '\n' ];

		if ( some( newLines, newLine => includes( content, newLine ) ) ) {
			actualCharIndex = 0;
			content = content
				.replace( '<br>', ' <br>' )
				.replace( '<br/>', ' <br/>' )
				.replace( '\n', ' \n' );

			while ( charsSoFar < charsToDisplay ) {
				const nextbatch = content.substring( actualCharIndex, actualCharIndex + 6 );
				if ( startsWith( nextbatch, '\n' ) ) {
					actualCharIndex += 1;
					charsSoFar += charactersPerLine;
				} else if ( startsWith( nextbatch, '<br/>' ) ) {
					actualCharIndex += 4;
					charsSoFar += charactersPerLine;
				} else if ( startsWith( nextbatch, '<br>' ) ) {
					actualCharIndex += 3;
					charsSoFar += charactersPerLine;
				} else {
					charsSoFar++;
				}
				actualCharIndex += 1;
			}
		} else {
			actualCharIndex = charsToDisplay;
		}

		const htmlContent = includes( [ 'is-single-line', 'is-excerpt' ], this.props.className )
			? truncate( this.props.content, {
				length: actualCharIndex,
				separator: / /,
				omission: ' ... ',
			} )
			: this.props.content;

		const showReadMore = ! hideMore && content.length > actualCharIndex;

		/*eslint-disable react/no-danger*/
		return (
			<AutoDirection>
				<div className={ classNames( 'comments__comment-content-wrapper', this.props.className ) }>
					<span
						className="comments__comment-content"
						dangerouslySetInnerHTML={ { __html: htmlContent } }
					/>
					{ showReadMore &&
						<span>
							<span className="comments__comment-read-more" onClick={ this.props.onMoreClicked }>
								{ this.props.translate( 'Read More' ) }
							</span>
						</span> }
				</div>
			</AutoDirection>
		);
		/*eslint-enable react/no-danger*/
	}
}

export default localize( withDimensions( PostCommentContent ) );
