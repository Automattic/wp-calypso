import { SandBox } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import {
	firstValid,
	formatTweetDate,
	hardTruncation,
	shortEnough,
	stripHtmlTags,
} from '../helpers';

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
	 * @returns {import('react').Element} The sidebar.
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
	 * @returns {import('react').Element} The header.
	 */
	renderHeader( name, screenName, date ) {
		return (
			<div className="twitter-preview__header">
				<span className="twitter-preview__name">{ name }</span>
				<span className="twitter-preview__screen-name">{ screenName }</span>
				<span>·</span>
				<span className="twitter-preview__date">{ formatTweetDate( date ) }</span>
			</div>
		);
	}

	/**
	 * Renders the text section of the tweet.
	 *
	 * @param {string} text The text of the tweet.
	 * @param {Object} card Optional. The card data for this tweet.
	 * @returns {import('react').Element} The text section.
	 */
	renderText( text, card = {} ) {
		// If the text ends with the card URL, remove it.
		const cardUrl = card.url || '';
		const deCardedText = text.endsWith( cardUrl )
			? text.substring( 0, text.lastIndexOf( cardUrl ) )
			: text;

		let __html = stripHtmlTags( deCardedText ).replace( /\n/g, '<br/>' );

		// Convert URLs to hyperlinks.
		__html = __html.replace(
			// TODO: Use a better regex here to match the URLs without protocol.
			/(https?:\/\/\S+)/g,
			'<a href="$1" rel="noopener noreferrer" target="_blank">$1</a>'
		);

		// Convert hashtags to hyperlinks.
		__html = __html.replace(
			/(^|\s)#(\w+)/g,
			'$1<a href="https://twitter.com/hashtag/$2" rel="noopener noreferrer" target="_blank">#$2</a>'
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
	 * @returns {import('react').Element} The media section.
	 */
	renderMedia( media ) {
		if ( ! media ) {
			return null;
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
			return null;
		}

		return (
			<div className={ mediaClasses }>
				{ isVideo &&
					filteredMedia.map( ( mediaItem, index ) => (
						// eslint-disable-next-line jsx-a11y/media-has-caption
						<video key={ `twitter-preview__media-item-${ index }` } controls>
							<source src={ mediaItem.url } type={ mediaItem.type } />{ ' ' }
						</video>
					) ) }
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
	 * @returns {import('react').Element} The quoted tweet.
	 */
	renderQuoteTweet( tweet ) {
		if ( ! tweet ) {
			return null;
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
	 * @param {Object} card The card data.
	 * @returns {import('react').Element} The card tweet.
	 */
	renderCard( card ) {
		if ( ! card ) {
			return null;
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
						<div className="twitter-preview__card-url">{ baseDomain( url || '' ) }</div>
						<div className="twitter-preview__card-title">{ title }</div>
						<div className="twitter-preview__card-description">
							{ twitterDescription( stripHtmlTags( description ) ) }
						</div>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * Renders the footer section of a single tweet, showing (non-functioning) reply, retweet, etc buttons.
	 *
	 * @returns {import('react').Element} The footer.
	 */
	renderFooter() {
		return (
			<div className="twitter-preview__footer">
				<span className="twitter-preview__icon-replies">
					<svg viewBox="0 0 24 24">
						<path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
					</svg>
				</span>
				<span className="twitter-preview__icon-retweets">
					<svg viewBox="0 0 24 24">
						<path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
					</svg>
				</span>
				<span className="twitter-preview__icon-likes">
					<svg viewBox="0 0 24 24">
						<path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
					</svg>
				</span>
				<span className="twitter-preview__icon-analytics">
					<svg viewBox="0 0 24 24">
						<path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
					</svg>
				</span>
				<span className="twitter-preview__icon-share">
					<svg viewBox="0 0 24 24">
						<path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
					</svg>
				</span>
			</div>
		);
	}

	render() {
		const { isLast, profileImage, name, screenName, date, text, media, tweet, card } = this.props;

		return (
			<div className="twitter-preview__container">
				{ this.renderSidebar( profileImage, isLast ) }
				<div className="twitter-preview__main">
					{ this.renderHeader( name, screenName, date ) }
					<div className="twitter-preview__content">
						{ this.renderText( text, card ) }
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
	card: PropTypes.object,
};

export default Tweet;
