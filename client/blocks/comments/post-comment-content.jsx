import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import AutoDirection from 'calypso/components/auto-direction';
import { sanitizeCommentHtml } from './sanitize-comment-html';

import './post-comment-content.scss';

class PostCommentContent extends Component {
	static propTypes = {
		content: PropTypes.string.isRequired,
		isPlaceholder: PropTypes.bool,
		className: PropTypes.string,
	};

	// Cached so markup is only sanitized again when it changes, and embeds don't reload on every render.
	getInnerHtml( content ) {
		if ( this.innerHtmlContent !== content ) {
			this.innerHtmlContent = content;
			this.innerHtml = { __html: sanitizeCommentHtml( content ) };
		}
		return this.innerHtml;
	}

	render() {
		// Don't trust comment content unless it was provided by the API
		const isBlockMarkup = this.props.content.includes( '<!-- wp:' );
		if ( this.props.isPlaceholder && ! isBlockMarkup ) {
			return (
				<div className={ clsx( 'comments__comment-content', this.props.className ) }>
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
		/*eslint-disable react/no-danger*/
		return (
			<AutoDirection>
				<div className={ clsx( 'comments__comment-content-wrapper', this.props.className ) }>
					<div
						className="comments__comment-content"
						dangerouslySetInnerHTML={ this.getInnerHtml( this.props.content ) }
					/>
				</div>
			</AutoDirection>
		);
		/*eslint-enable react/no-danger*/
	}
}

export default localize( PostCommentContent );
