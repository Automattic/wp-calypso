/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { throttle, constant, noop, truncate, head, filter, get } from 'lodash';
import classnames from 'classnames';
import ReactDom from 'react-dom';
import closest from 'component-closest';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import DisplayTypes from 'state/reader/posts/display-types';
import ReaderPostActions from 'blocks/reader-post-actions';
import * as stats from 'reader/stats';
import PostByline from './byline';
import EmbedHelper from 'reader/embed-helper';

function FeaturedImage( { imageUri, href, children, onClick } ) {
	if ( imageUri === undefined ) {
		return null;
	}

	const featuredImageStyle = {
		backgroundImage: 'url(' + imageUri + ')',
		backgroundSize: 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: '50% 50%'
	};

	return (
		<a className="reader-post-card__featured-image" href={ href } style={ featuredImageStyle } onClick={ onClick } >
			{ children }
		</a>
	);
}

class FeaturedVideo extends React.Component {

	constructor( props ) {
		super( props );
		this.state = {
			preferThumbnail: true
		};
	}

	setVideoSizingStrategy = ( videoEmbed ) => {
		let sizingFunction = constant( {} );
		if ( videoEmbed ) {
			const maxWidth = ReactDom.findDOMNode( this ).parentNode.offsetWidth;
			const embedSize = EmbedHelper.getEmbedSizingFunction( videoEmbed );

			sizingFunction = ( available = maxWidth ) => embedSize( available );
		}
		this.getEmbedSize = sizingFunction;
	}

	updateVideoSize = () => {
		if ( this.videoEmbedRef ) {
			const iframe = ReactDom.findDOMNode( this.videoEmbedRef ).querySelector( 'iframe' );
			Object.assign( iframe.style, this.getEmbedSize() );
		}
	}

	handleThumbnailClick = ( e ) => {
		e.preventDefault();
		this.setState( { preferThumbnail: false }, () => this.updateVideoSize() );
	}

	setVideoEmbedRef = ( c ) => {
		this.videoEmbedRef = c;
		this.setVideoSizingStrategy( this.props.videoEmbed );
	}

	componentDidMount() {
		window.addEventListener( 'resize', throttle( this.updateVideoSize, 100 ) );
	}

	render() {
		const { thumbnailUrl, autoplayIframe, iframe } = this.props;
		const preferThumbnail = this.state.preferThumbnail;

		if ( preferThumbnail && thumbnailUrl ) {
			return (
				<FeaturedImage imageUri={ thumbnailUrl } onClick={ this.handleThumbnailClick }>
					<div className="reader-post-card__play-icon-container"
						title={ translate( 'Click to Play' ) }>
						<img className="reader-post-card__play-icon" src="/calypso/images/reader/play-icon.png" />
					</div>
				</FeaturedImage>
			);
		}

		/* eslint-disable react/no-danger */
		return (
			<div ref={ this.setVideoEmbedRef }
				dangerouslySetInnerHTML={ { __html: thumbnailUrl ? autoplayIframe : iframe } }
			/>
		);
		/* eslint-enable-line react/no-danger */
	}
}

export default class RefreshPostCard extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		onClick: PropTypes.func,
		onCommentClick: PropTypes.func
	};

	static defaultProps = {
		onClick: noop,
		onCommentClick: noop
	};

	propagateCardClick = () => {
		const postToOpen = this.props.post;

		// @todo
		// For Discover posts (but not site picks), open the original post in full post view
		// https://github.com/Automattic/wp-calypso/issues/8696

		this.props.onClick( { post: postToOpen, site: this.props.site, feed: this.props.feed } );
	}

	handleCardClick = ( event ) => {
		const rootNode = ReactDom.findDOMNode( this ),
			selection = window.getSelection && window.getSelection();

		// if the click has modifier or was not primary, ignore it
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			if ( closest( event.target, '.reader-post-card__title-link', true, rootNode ) ) {
				stats.recordPermalinkClick( 'card_title_with_modifier', this.props.post );
			}
			return;
		}

		if ( closest( event.target, '.should-scroll', true, rootNode ) ) {
			setTimeout( function() {
				window.scrollTo( 0, 0 );
			}, 100 );
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel~=external]', true, rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if ( closest( event.target, 'a', true, rootNode ) && closest( event.target, '.reader-post-card__excerpt', true, rootNode ) ) {
			return;
		}

		// ignore clicks when highlighting text
		if ( selection && selection.toString() ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) { // some child handled it
			event.preventDefault();
			this.propagateCardClick();
		}
	}

	render() {
		const { post, site, feed, onCommentClick } = this.props;
		const featuredImage = post.canonical_image;
		const isPhotoOnly = post.display_type & DisplayTypes.PHOTO_ONLY;
		const title = truncate( post.title, {
			length: 140,
			separator: /,? +/
		} );

		// only feature an embed if we know how to thumbnail & autoplay it
		const featuredEmbed = head( filter( post.content_embeds, ( embed ) => embed.thumbnailUrl && embed.autoplayIframe ) );

		// we only show a featured embed when all of these are true
		//   - there is no featured image on the post that's big enough to pass as the canonical image
		//   - there is an available embed
		//
		const useFeaturedEmbed = featuredEmbed &&
			( ! featuredImage || ( featuredImage !== post.featured_image && featuredImage !== get( post, 'post_thumbnail.URL' ) ) );

		const featuredAsset = useFeaturedEmbed
			? <FeaturedVideo { ...featuredEmbed } videoEmbed={ featuredEmbed } />
			: <FeaturedImage imageUri={ get( featuredImage, 'uri' ) } href={ post.URL } />;

		const classes = classnames( 'reader-post-card', {
			'has-thumbnail': !! featuredAsset,
			'is-photo': isPhotoOnly
		} );

		return (
			<Card className={ classes } onClick={ this.handleCardClick }>
				<PostByline post={ post } site={ site } feed={ feed } />
				<div className="reader-post-card__post">
					{ featuredAsset }
					<div className="reader-post-card__post-details">
						<h1 className="reader-post-card__title">
							<a className="reader-post-card__title-link" href={ post.URL }>{ title }</a>
						</h1>
						{ ! isPhotoOnly && <div className="reader-post-card__excerpt">{ post.short_excerpt }</div> }
						{ post &&
							<ReaderPostActions
								post={ post }
								showVisit={ true }
								showMenu={ true }
								onCommentClick={ onCommentClick }
								showEdit={ false }
								className="ignore-click"
								iconSize={ 18 } />
						}
					</div>
				</div>
				{ this.props.children }
			</Card>
		);
	}
}
