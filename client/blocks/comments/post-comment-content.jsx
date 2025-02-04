import clsx from 'clsx';
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
		if ( this.props.isPlaceholder ) {
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
						dangerouslySetInnerHTML={ { __html: this.props.content } }
					/>
				</div>
			</AutoDirection>
		);
		/*eslint-enable react/no-danger*/
	}
}

export default localize( PostCommentContent );
