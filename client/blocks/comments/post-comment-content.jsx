import clsx from 'clsx';
import DOMPurify from 'dompurify';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import AutoDirection from 'calypso/components/auto-direction';

import './post-comment-content.scss';

class PostCommentContent extends Component {
	static propTypes = {
		content: PropTypes.string.isRequired,
		isPlaceholder: PropTypes.bool,
		className: PropTypes.string,
		setWithDimensionsRef: PropTypes.func,
	};

	static defaultProps = {
		setWithDimensionsRef: () => {},
	};

	// React 19 rewrites innerHTML whenever this prop is a new object, which reloads embeds.
	getInnerHtml( content, isPlaceholder ) {
		if ( this.innerHtmlContent !== content || this.innerHtmlIsPlaceholder !== isPlaceholder ) {
			this.innerHtmlContent = content;
			this.innerHtmlIsPlaceholder = isPlaceholder;
			// A pending comment from the block editor shows its markup sanitized, as the API will render it.
			this.innerHtml = { __html: isPlaceholder ? DOMPurify.sanitize( content ) : content };
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
						ref={ this.props.setWithDimensionsRef }
						dangerouslySetInnerHTML={ this.getInnerHtml(
							this.props.content,
							this.props.isPlaceholder
						) }
					/>
				</div>
			</AutoDirection>
		);
		/*eslint-enable react/no-danger*/
	}
}

export default localize( PostCommentContent );
