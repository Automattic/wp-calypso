/**
 * External Dependencies
 */
import React from 'react';
import { has } from 'lodash';
import ReactDom from 'react-dom';
import closest from 'component-closest';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import ReaderExcerpt from 'blocks/reader-excerpt';
import ReaderVisitLink from 'blocks/reader-visit-link';
import ReaderAuthorLink from 'blocks/reader-author-link';
import { recordPermalinkClick } from 'reader/stats';
import PostTime from 'reader/post-time';
import ReaderFeaturedImage from 'blocks/reader-featured-image';
import ReaderFeaturedVideo from 'blocks/reader-featured-video';
import * as stats from 'reader/stats';
import ReaderCombinedCardPostPlaceholder from 'blocks/reader-combined-card/placeholders/post';

class ReaderCombinedCardPost extends React.Component {
	static propTypes = {
		post: React.PropTypes.object.isRequired,
		streamUrl: React.PropTypes.string,
		onClick: React.PropTypes.func,
		showFeaturedAsset: React.PropTypes.bool,
	};

	static defaultProps = {
		showFeaturedAsset: true,
	}

	handleCardClick = ( event ) => {
		const rootNode = ReactDom.findDOMNode( this );
		const selection = window.getSelection && window.getSelection();

		// if the click has modifier or was not primary, ignore it
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			if ( closest( event.target, '.reader-combined-card__post-title-link', true, rootNode ) ) {
				stats.recordPermalinkClick( 'card_title_with_modifier', this.props.post );
			}
			return;
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel~=external]', true, rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if ( closest( event.target, 'a', true, rootNode ) && closest( event.target, '.reader-excerpt', true, rootNode ) ) {
			return;
		}

		// ignore clicks when highlighting text
		if ( selection && selection.toString() ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) { // some child handled it
			event.preventDefault();
			this.props.onClick( this.props.post );
		}
	}

	render() {
		const { post, streamUrl, isDiscover, isSelected } = this.props;
		const isLoading = ! post || post._state === 'pending' || post._state === 'minimal';

		if ( isLoading ) {
			return <ReaderCombinedCardPostPlaceholder />;
		}

		const hasAuthorName = has( post, 'author.name' );
		let featuredAsset = null;
		if ( post.canonical_media && post.canonical_media.mediaType === 'video' ) {
			featuredAsset = <ReaderFeaturedVideo { ...post.canonical_media } videoEmbed={ post.canonical_media } allowPlaying={ false } />;
		} else if ( post.canonical_media ) {
			featuredAsset = <ReaderFeaturedImage imageWidth={ 100 } imageUrl={ post.canonical_media.src } href={ post.URL } />;
		}

		const recordDateClick = () => {
			recordPermalinkClick( 'timestamp_combined_card', post );
		};

		const classes = classnames( {
			'reader-combined-card__post': true,
			'is-selected': isSelected,
			'has-featured-asset': !! featuredAsset,
		} );

		return (
			<li className={ classes } onClick={ this.handleCardClick }>
				{ this.props.showFeaturedAsset &&
					<div className="reader-combined-card__featured-asset-wrapper">
						{ featuredAsset }
					</div>
				}
				<div className="reader-combined-card__post-details">
					<AutoDirection>
						<h1 className="reader-combined-card__post-title">
							<a className="reader-combined-card__post-title-link" href={ post.URL }>{ post.title }</a>
						</h1>
					</AutoDirection>
					<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
					<div className="reader-combined-card__post-author-and-time ignore-click">
						<ReaderVisitLink href={ post.URL } iconSize={ 14 }>
							{ this.props.translate( 'Visit' ) }
						</ReaderVisitLink>
						{ hasAuthorName &&
							<ReaderAuthorLink
								className="reader-combined-card__author-link"
								author={ post.author }
								siteUrl={ streamUrl }
								post={ post }>
								{ post.author.name }
							</ReaderAuthorLink>
						}
						{ post.date && post.URL &&
							<span className="reader-combined-card__timestamp">
								{ hasAuthorName && <span>, </span> }
								<a className="reader-combined-card__timestamp-link"
									onClick={ recordDateClick }
									href={ post.URL }
									target="_blank"
									rel="noopener noreferrer">
									<PostTime date={ post.date } />
								</a>
							</span>
						}
					</div>
				</div>
			</li>
		);
	}
}

export default localize( ReaderCombinedCardPost );
