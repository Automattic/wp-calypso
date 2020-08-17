/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import moment from 'moment';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { stripHtmlTags } from '../helpers';

/**
 * Style dependencies
 */
import './style.scss';

export class TwitterThreadPreview extends PureComponent {
	createTweetMarkup( tweet ) {
		const tweetText = stripHtmlTags( tweet.text ).replaceAll( '\n', '<br/>' );

		return {
			__html: tweetText,
		};
	}

	render() {
		const { tweets } = this.props;

		// We can enable dangerouslySetInnerHTML here, since the text we're using is stripped
		// of all HTML tags, then only has safe tags added in createTweetMarkup().
		/*eslint-disable react/no-danger*/
		return (
			<div className="twitter-thread-preview">
				{ tweets &&
					tweets.map( ( tweet, index ) => {
						return (
							<div
								className="twitter-thread-preview__container"
								key={ `twitter-thread-preview__tweet-${ index }` }
							>
								<div className="twitter-thread-preview__sidebar">
									<div className="twitter-thread-preview__profile-image">
										<img alt={ __( 'Twitter profile image' ) } src={ tweet.profileImage } />
									</div>
									{ index + 1 !== tweets.length && (
										<div className="twitter-thread-preview__connector" />
									) }
								</div>
								<div className="twitter-thread-preview__main">
									<div className="twitter-thread-preview__header">
										<span className="twitter-thread-preview__name">{ tweet.name }</span>
										<span className="twitter-thread-preview__screen-name">
											{ tweet.screenName }
										</span>
										<span className="twitter-thread-preview__date">
											{ moment( tweet.date ).format( 'MMM D' ) }
										</span>
									</div>
									<div className="twitter-thread-preview__content">
										<div
											className="twitter-thread-preview__text"
											dangerouslySetInnerHTML={ this.createTweetMarkup( tweet ) }
										/>
									</div>
									<div className="twitter-thread-preview__footer">
										<span className="twitter-thread-preview__icon-replies">
											<svg viewBox="0 0 24 24">
												<path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z" />
											</svg>
										</span>
										<span className="twitter-thread-preview__icon-retweets">
											<svg viewBox="0 0 24 24">
												<path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z" />
											</svg>
										</span>
										<span className="twitter-thread-preview__icon-likes">
											<svg viewBox="0 0 24 24">
												<path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z" />
											</svg>
										</span>
										<span className="twitter-thread-preview__icon-share">
											<svg viewBox="0 0 24 24">
												<path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z"></path>
												<path d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z" />
											</svg>
										</span>
									</div>
								</div>
							</div>
						);
					} ) }
			</div>
		);
		/*eslint-enabled react/no-danger*/
	}
}

TwitterThreadPreview.propTypes = {
	tweets: PropTypes.array,
};

export default TwitterThreadPreview;
