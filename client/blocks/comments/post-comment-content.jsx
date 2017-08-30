/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import withDimensions from 'lib/with-dimensions';
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';

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
		/*eslint-disable react/no-danger*/
		return (
			<AutoDirection>
				<div className={ classNames( 'comments__comment-content-wrapper', this.props.className ) }>
					<Emojify>
						<div
							className="comments__comment-content"
							ref={ this.props.setWithDimensionsRef }
							dangerouslySetInnerHTML={ { __html: this.props.content } }
						/>
					</Emojify>
					{ this.props.overflowY &&
						! this.props.hideMore &&
						<span className="comments__comment-read-more" onClick={ this.props.onMoreClicked }>
							{ this.props.translate( 'Read More' ) }
						</span> }
				</div>
			</AutoDirection>
		);
		/*eslint-enable react/no-danger*/
	}
}

export default localize( withDimensions( PostCommentContent ) );
