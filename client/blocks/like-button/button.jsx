/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { omitBy, isNull } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import LikeIcons from './icons';

/**
 * Style dependencies
 */
import './style.scss';

class LikeButton extends PureComponent {
	static propTypes = {
		liked: PropTypes.bool,
		showZeroCount: PropTypes.bool,
		likeCount: PropTypes.number,
		showLabel: PropTypes.bool,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
		onLikeToggle: PropTypes.func,
		likedLabel: PropTypes.string,
		iconSize: PropTypes.number,
		animateLike: PropTypes.bool,
		postId: PropTypes.number,
		slug: PropTypes.string,
	};

	static defaultProps = {
		liked: false,
		showZeroCount: false,
		likeCount: 0,
		showLabel: true,
		iconSize: 24,
		animateLike: true,
		postId: null,
		slug: null,
	};

	constructor( props ) {
		super( props );

		this.toggleLiked = this.toggleLiked.bind( this );
	}

	toggleLiked( event ) {
		if ( event ) {
			event.preventDefault();
		}
		if ( this.props.onLikeToggle ) {
			this.props.onLikeToggle( ! this.props.liked );
		}
	}

	render() {
		const {
			likeCount,
			tagName: containerTag = 'li',
			showZeroCount,
			postId,
			slug,
			translate,
			onMouseEnter,
			onMouseLeave,
		} = this.props;
		const showLikeCount = likeCount > 0 || showZeroCount;
		const isLink = containerTag === 'a';
		const containerClasses = {
			'like-button': true,
			'ignore-click': true,
			'is-mini': this.props.isMini,
			'is-animated': this.props.animateLike,
			'has-count': showLikeCount,
			'has-label': this.props.showLabel,
		};
		let likeLabel = translate( 'Like', {
			context: 'verb: imperative',
			comment: 'Label for a button to "like" a post.',
		} );

		if ( this.props.liked ) {
			containerClasses[ 'is-liked' ] = true;

			if ( this.props.likedLabel ) {
				likeLabel = this.props.likedLabel;
			} else {
				likeLabel = translate( 'Liked', { comment: 'Displayed when a person "likes" a post.' } );
			}
		}

		// Override the label with a counter
		if ( showLikeCount ) {
			likeLabel = translate( 'Like', 'Likes', {
				count: likeCount,
				context: 'noun',
				comment: 'Number of likes.',
			} );
		}

		const labelElement = (
			<span className="like-button__label">
				<span className="like-button__label-count">{ showLikeCount ? likeCount : '' }</span>
				{ this.props.showLabel && <span className="like-button__label-status">{ likeLabel }</span> }
			</span>
		);

		const href = isLink ? `/stats/post/${ postId }/${ slug }` : null;
		return React.createElement(
			containerTag,
			omitBy(
				{
					href,
					className: classNames( containerClasses ),
					onClick: ! isLink ? this.toggleLiked : null,
					onMouseEnter,
					onMouseLeave,
				},
				isNull
			),
			<LikeIcons size={ this.props.iconSize } />,
			labelElement
		);
	}
}

export default localize( LikeButton );
