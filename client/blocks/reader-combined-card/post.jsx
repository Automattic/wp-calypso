import clsx from 'clsx';
import closest from 'component-closest';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderCombinedCardPostPlaceholder from 'calypso/blocks/reader-combined-card/placeholders/post';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import ReaderFeaturedVideo from 'calypso/blocks/reader-featured-video';
import ReaderVisitLink from 'calypso/blocks/reader-visit-link';
import AutoDirection from 'calypso/components/auto-direction';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import TimeSince from 'calypso/components/time-since';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';
import { isAuthorNameBlocked } from 'calypso/reader/lib/author-name-blocklist';
import { recordPermalinkClick } from 'calypso/reader/stats';

class ReaderCombinedCardPost extends Component {
	static propTypes = {
		currentRoute: PropTypes.string,
		isWPForTeamsItem: PropTypes.bool,
		hasOrganization: PropTypes.bool,
		post: PropTypes.object,
		streamUrl: PropTypes.string,
		onClick: PropTypes.func,
		showFeaturedAsset: PropTypes.bool,
	};

	static defaultProps = {
		hasOrganization: false,
		showFeaturedAsset: true,
	};

	handleCardClick = ( event ) => {
		const rootNode = ReactDom.findDOMNode( this );
		const selection = window.getSelection && window.getSelection();

		// if the click has modifier or was not primary, ignore it
		if ( event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			if ( closest( event.target, '.reader-combined-card__post-title-link', rootNode ) ) {
				recordPermalinkClick( 'card_title_with_modifier', this.props.post );
			}
			return;
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel~=external]', rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if (
			closest( event.target, 'a', rootNode ) &&
			closest( event.target, '.reader-excerpt', rootNode )
		) {
			return;
		}

		// ignore clicks when highlighting text
		if ( selection && selection.toString() ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) {
			// some child handled it
			event.preventDefault();
			this.props.onClick( this.props.post );
		}
	};

	render() {
		const {
			currentRoute,
			post,
			streamUrl,
			isSelected,
			postKey,
			hasOrganization,
			isWPForTeamsItem,
		} = this.props;
		const isLoading = ! post || post._state === 'pending' || post._state === 'minimal';

		if ( isLoading ) {
			return (
				<Fragment>
					<QueryReaderPost postKey={ postKey } />
					<ReaderCombinedCardPostPlaceholder />
				</Fragment>
			);
		}

		const hasAuthorName =
			post.author?.hasOwnProperty( 'name' ) && ! isAuthorNameBlocked( post.author.name );
		let featuredAsset = null;
		if ( post.canonical_media && post.canonical_media.mediaType === 'video' ) {
			featuredAsset = (
				<ReaderFeaturedVideo
					{ ...post.canonical_media }
					videoEmbed={ post.canonical_media }
					allowPlaying={ false }
				/>
			);
		} else if ( post.canonical_media ) {
			featuredAsset = (
				<ReaderFeaturedImage
					imageWidth={ 100 }
					imageUrl={ post.canonical_media.src }
					href={ post.URL }
				/>
			);
		}

		const recordDateClick = () => {
			recordPermalinkClick( 'timestamp_combined_card', post );
		};

		let isSeen = false;
		if ( isEligibleForUnseen( { isWPForTeamsItem, currentRoute, hasOrganization } ) ) {
			isSeen = post?.is_seen;
		}
		const classes = clsx( {
			'reader-combined-card__post': true,
			'is-selected': isSelected,
			'is-seen': isSeen,
			'has-featured-asset': !! featuredAsset,
		} );

		/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */
		return (
			<li className={ classes } onClick={ this.handleCardClick }>
				{ this.props.showFeaturedAsset && (
					<div className="reader-combined-card__featured-asset-wrapper">{ featuredAsset }</div>
				) }
				<div className="reader-combined-card__post-details">
					<AutoDirection>
						<h1 className="reader-combined-card__post-title">
							<a className="reader-combined-card__post-title-link" href={ post.URL }>
								{ post.title }
							</a>
						</h1>
					</AutoDirection>
					<ReaderExcerpt post={ post } />
					<div className="reader-combined-card__post-author-and-time ignore-click">
						<ReaderVisitLink href={ post.URL } iconSize={ 14 }>
							{ this.props.translate( 'Visit' ) }
						</ReaderVisitLink>
						{ hasAuthorName && (
							<ReaderAuthorLink
								className="reader-combined-card__author-link"
								author={ post.author }
								siteUrl={ streamUrl }
								post={ post }
							>
								{ post.author.name }
							</ReaderAuthorLink>
						) }
						{ post.date && post.URL && (
							<span className="reader-combined-card__timestamp">
								{ hasAuthorName && <span>, </span> }
								<a
									className="reader-combined-card__timestamp-link"
									onClick={ recordDateClick }
									href={ post.URL }
									target="_blank"
									rel="noopener noreferrer"
								>
									<TimeSince date={ post.date } />
								</a>
							</span>
						) }
					</div>
				</div>
			</li>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */
	}
}

export default localize( ReaderCombinedCardPost );
