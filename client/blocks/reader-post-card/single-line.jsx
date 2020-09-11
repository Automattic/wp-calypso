/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';
import FeaturedAsset from './featured-asset';

/**
 * Style dependencies
 */
import './style.scss';

const SingleLinePost = ( { post, postByline, children, isDiscover, onClick } ) => {
	/* eslint-disable wpcalypso/jsx-classname-namespace,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
	return (
		<div className="reader-post-card__post reader-post-card__single-line-post" onClick={ onClick }>
			<img
				className="reader-post-card__avatar"
				src="https://2.gravatar.com/avatar/5512fbf07ae3dd340fb6ed4924861c8e?s=30&d=mm"
			/>
			<div className="reader-post-card__author-name">
				<a href="#">Chris R</a>
			</div>
			<AutoDirection>
				<h1 className="reader-post-card__title">
					<a className="reader-post-card__title-link" href={ post.URL }>
						<Emojify>{ post.title }</Emojify>
					</a>
				</h1>
			</AutoDirection>
			<div className="reader-post-card__fuzzy-date">2h ago</div>
			<div className="reader-post-card__comment-count">💬 2</div>
		</div>
	);
	/* eslint-disable wpcalypso/jsx-classname-namespace,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
};

SingleLinePost.propTypes = {
	post: PropTypes.object.isRequired,
	postByline: PropTypes.object,
	isDiscover: PropTypes.bool,
};

export default SingleLinePost;
