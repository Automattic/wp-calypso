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
		// A pending comment from the block editor shows its markup sanitized, as the API will render it.
		const content = this.props.isPlaceholder
			? DOMPurify.sanitize( this.props.content )
			: this.props.content;

		/*eslint-disable react/no-danger*/
		return (
			<AutoDirection>
				<div className={ clsx( 'comments__comment-content-wrapper', this.props.className ) }>
					<div
						className="comments__comment-content"
						ref={ this.props.setWithDimensionsRef }
						dangerouslySetInnerHTML={ { __html: content } }
					/>
				</div>
			</AutoDirection>
		);
		/*eslint-enable react/no-danger*/
	}
}

export default localize( PostCommentContent );
