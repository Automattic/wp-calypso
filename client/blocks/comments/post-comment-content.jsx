/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import AutoDirection from 'components/auto-direction';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { truncate, get } from 'lodash';

/**
 * Internal Dependencies
 */

const CHAR_LIMITS = {
	'is-single-line': 30,
	'is-excerpt': 90,
};

class PostCommentContent extends React.Component {
	static propTypes = {
		content: PropTypes.string.isRequired,
		isPlaceholder: PropTypes.bool,
		className: PropTypes.string,
		onMoreClicked: PropTypes.func,
		hideMore: PropTypes.bool,
	};

	render() {
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

		const trimAmount = get( CHAR_LIMITS, this.props.className, Infinity );
		const showReadMore = ! this.props.hideMore && this.props.content.length > trimAmount;
		console.error( trimAmount, showReadMore );

		const htmlContent = showReadMore ? truncate( this.props.content, trimAmount ) : this.props.content;

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
							<span className="comments__comment-read-more-ellipsis">...</span>
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

export default localize( PostCommentContent );
