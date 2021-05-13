/**
 * External dependencies
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import moment from 'moment';
import { __ } from '@wordpress/i18n';
import { SandBox } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { firstValid, hardTruncation, shortEnough, stripHtmlTags } from '../helpers';

/**
 * Style dependencies
 */
import './style.scss';

const DESCRIPTION_LENGTH = 200;

const baseDomain = ( url ) =>
	url
		.replace( /^[^/]+[/]*(www\.)?/, '' ) // Strip leading protocol and "www.".
		.replace( /\/.*$/, '' ); // Strip everything after the domain.

const twitterDescription = firstValid(
	shortEnough( DESCRIPTION_LENGTH ),
	hardTruncation( DESCRIPTION_LENGTH )
);

export class Tweet extends PureComponent {
	/**
	 * Renders the sidebar beside the tweet.
	 *
	 * @param {string} profileImage URL of the Twitter profile image.
	 * @param {boolean} isLast Whether or not this is the last tweet in the in a thread.
	 *
	 * @returns {React.Element} The sidebar.
	 */
	renderSidebar( profileImage, isLast ) {
		return (
			<div className="twitter-preview__sidebar">
				<div className="twitter-preview__profile-image">
					<img alt={ __( 'Twitter profile image' ) } src={ profileImage } />
				</div>
				{ ! isLast && <div className="twitter-preview__connector" /> }
			</div>
		);
	}

	/**
	 * Renders the header section of a single tweet.
	 *
	 * @param {string} name The display name of the Twitter account.
	 * @param {string} screenName The at-name of the Twitter account.
	 * @param {Date} date The date to be shown for this preview.
	 *
	 * @returns {React.Element} The header.
	 */
	renderHeader( name, screenName, date ) {
		return (
			<div className="twitter-preview__header">
				<span className="twitter-preview__name">{ name }</span>
				<span className="twitter-preview__screen-name">{ screenName }</span>
				<span className="twitter-preview__date">{ moment( date ).format( 'MMM D' ) }</span>
			</div>
		);
	}

	/**
	 * Renders the text section of the tweet.
	 *
	 * @param {string} text The text of the tweet.
	 * @param {Array} urls Optional. An array of URLs that are in the text.
	 * @param {object} card Optional. The card data for this tweet.
	 *
	 * @returns {React.Element} The text section.
	 */
	renderText( text, urls = [], card = {} ) {
		// If the text ends with the card URL, remove it.
		const cardUrl = card.url || '';
		const deCardedText = text.endsWith( cardUrl )
			? text.substr( 0, text.lastIndexOf( cardUrl ) )
			: text;

		const __html = urls.reduce(
			( html, url ) =>
				html.replace( new RegExp( '\\(' + url + '\\)', 'g' ), `(<a href="${ url }">${ url }</a>)` ),
			stripHtmlTags( deCardedText ).replace( new RegExp( '\\n', 'g' ), '<br/>' )
		);

		// We can enable dangerouslySetInnerHTML here, since the text we're using is stripped
		// of all HTML tags, then only has safe tags added in createTweetMarkup().
		/* eslint-disable react/no-danger */
		return <div className="twitter-preview__text" dangerouslySetInnerHTML={ { __html } } />;
		/* eslint-enabled react/no-danger */
	}

	/**
	 * Renders the media section of the tweet. It will render up to four individual images, or a single
	 * GIF, or a single video. Any media beyond these limits will be discarded.
	 *
	 * @param {Array} media The media to include in this tweet.
	 *
	 * @returns {React.Element} The media section.
	 */
	renderMedia( media ) {
		if ( ! media ) {
			return;
		}

		// Ensure we're only trying to show valid media, and the correct quantity.
		const filteredMedia = media
			// Only image/ and video/ mime types are supported.
			.filter(
				( mediaItem ) =>
					mediaItem.type.startsWith( 'image/' ) || mediaItem.type.startsWith( 'video/' )
			)
			.filter( ( mediaItem, idx, array ) => {
				// We'll always keep the first item.
				if ( 0 === idx ) {
					return true;
				}

				// If the first item was a video or GIF, discard all subsequent items.
				if ( array[ 0 ].type.startsWith( 'video/' ) || 'image/gif' === array[ 0 ].type ) {
					return false;
				}

				// The first item wasn't a video or GIF, so discard all subsequent videos and GIFs.
				if ( mediaItem.type.startsWith( 'video/' ) || 'image/gif' === mediaItem.type ) {
					return false;
				}

				return true;
			} )
			// We only want the first four items of the array, at most.
			.slice( 0, 4 );

		const isVideo = filteredMedia.length > 0 && filteredMedia[ 0 ].type.startsWith( 'video/' );

		const mediaClasses = classnames( [
			'twitter-preview__media',
			'twitter-preview__media-children-' + filteredMedia.length,
		] );

		if ( 0 === filteredMedia.length ) {
			return;
		}

		return (
			<div className={ mediaClasses }>
				{
					/* eslint-disable jsx-a11y/media-has-caption */
					isVideo &&
						filteredMedia.map( ( mediaItem, index ) => (
							<video key={ `twitter-preview__media-item-${ index }` } controls>
								<source src={ mediaItem.url } type={ mediaItem.type } />{ ' ' }
							</video>
						) )
					/* eslint-disable jsx-a11y/media-has-caption */
				}
				{ ! isVideo &&
					filteredMedia.map( ( mediaItem, index ) => (
						<img
							key={ `twitter-preview__media-item-${ index }` }
							alt={ mediaItem.alt }
							src={ mediaItem.url }
						/>
					) ) }
			</div>
		);
	}

	/**
	 * Given a tweet URL, renders it as a quoted tweet.
	 *
	 * @param {string} tweet The tweet URL.
	 *
	 * @returns {React.Element} The quoted tweet.
	 */
	renderQuoteTweet( tweet ) {
		if ( ! tweet ) {
			return;
		}

		return (
			<div className="twitter-preview__quote-tweet">
				<SandBox
					html={ `<blockquote class="twitter-tweet" data-conversation="none" data-dnt="true"><a href="${ tweet }"></a></blockquote>` }
					scripts={ [ 'https://platform.twitter.com/widgets.js' ] }
					title="Embedded tweet"
					onFocus={ this.hideOverlay }
				/>
				<div className="twitter-preview__quote-tweet-overlay" />
			</div>
		);
	}

	/**
	 * Given card data, renders the Twitter-style card.
	 *
	 * @param {object} card The card data.
	 *
	 * @returns {React.Element} The card tweet.
	 */
	renderCard( card ) {
		if ( ! card ) {
			return;
		}

		const { description, image, title, type, url } = card;

		const cardClassNames = classnames( `twitter-preview__card-${ type }`, {
			'twitter-preview__card-has-image': !! image,
		} );
		return (
			<div className="twitter-preview__card">
				<div className={ cardClassNames }>
					{ image && <img className="twitter-preview__card-image" src={ image } alt="" /> }
					<div className="twitter-preview__card-body">
						<div className="twitter-preview__card-title">{ title }</div>
						<div className="twitter-preview__card-description">
							{ twitterDescription( stripHtmlTags( description ) ) }
						</div>
						<div className="twitter-preview__card-url">
							<svg viewBox="0 0 24 24">
								<g>
									<path d="M11.96 14.945c-.067 0-.136-.01-.203-.027-1.13-.318-2.097-.986-2.795-1.932-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608c2.322-1.716 5.61-1.224 7.33 1.1.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094c-.333.246-.804.175-1.05-.158-.246-.334-.176-.804.158-1.05l1.48-1.095c.803-.592 1.327-1.463 1.476-2.45.148-.988-.098-1.975-.69-2.778-1.225-1.656-3.572-2.01-5.23-.784l-3.53 2.608c-.802.593-1.326 1.464-1.475 2.45-.15.99.097 1.975.69 2.778.498.675 1.187 1.15 1.992 1.377.4.114.633.528.52.928-.092.33-.394.547-.722.547z" />
									<path d="M7.27 22.054c-1.61 0-3.197-.735-4.225-2.125-.832-1.127-1.176-2.51-.968-3.894s.943-2.605 2.07-3.438l1.478-1.094c.334-.245.805-.175 1.05.158s.177.804-.157 1.05l-1.48 1.095c-.803.593-1.326 1.464-1.475 2.45-.148.99.097 1.975.69 2.778 1.225 1.657 3.57 2.01 5.23.785l3.528-2.608c1.658-1.225 2.01-3.57.785-5.23-.498-.674-1.187-1.15-1.992-1.376-.4-.113-.633-.527-.52-.927.112-.4.528-.63.926-.522 1.13.318 2.096.986 2.794 1.932 1.717 2.324 1.224 5.612-1.1 7.33l-3.53 2.608c-.933.693-2.023 1.026-3.105 1.026z" />
								</g>
							</svg>
							{ baseDomain( url || '' ) }
						</div>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * Renders the footer section of a single tweet, showing (non-functioning) reply, retweet, etc buttons.
	 *
	 * @returns {React.Element} The footer.
	 */
	renderFooter() {
		return (
			<div className="twitter-preview__footer">
				<span className="twitter-preview__icon-replies">
					<svg viewBox="0 0 24 24">
						<path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z" />
					</svg>
				</span>
				<span className="twitter-preview__icon-retweets">
					<svg viewBox="0 0 24 24">
						<path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z" />
					</svg>
				</span>
				<span className="twitter-preview__icon-likes">
					<svg viewBox="0 0 24 24">
						<path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z" />
					</svg>
				</span>
				<span className="twitter-preview__icon-share">
					<svg viewBox="0 0 24 24">
						<path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z"></path>
						<path d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z" />
					</svg>
				</span>
			</div>
		);
	}

	render() {
		const {
			isLast,
			profileImage,
			name,
			screenName,
			date,
			text,
			media,
			tweet,
			urls,
			card,
		} = this.props;

		return (
			<div className="twitter-preview__container">
				{ this.renderSidebar( profileImage, isLast ) }
				<div className="twitter-preview__main">
					{ this.renderHeader( name, screenName, date ) }
					<div className="twitter-preview__content">
						{ this.renderText( text, urls, card ) }
						{ this.renderMedia( media ) }
						{ this.renderQuoteTweet( tweet ) }
						{ this.renderCard( card ) }
					</div>
					{ this.renderFooter() }
				</div>
			</div>
		);
	}
}

Tweet.propTypes = {
	tweets: PropTypes.array,
	isLast: PropTypes.bool,
	profileImage: PropTypes.string,
	name: PropTypes.string,
	screenName: PropTypes.string,
	date: PropTypes.number,
	text: PropTypes.string,
	media: PropTypes.array,
	tweet: PropTypes.string,
	urls: PropTypes.array,
	card: PropTypes.object,
};

export default Tweet;
