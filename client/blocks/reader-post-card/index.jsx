/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { noop, truncate, get } from 'lodash';
import classnames from 'classnames';
import ReactDom from 'react-dom';
import closest from 'component-closest';
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import DisplayTypes from 'state/reader/posts/display-types';
import Gravatar from 'components/gravatar';
import Gridicon from 'components/gridicon';
import ReaderPostActions from 'blocks/reader-post-actions';
import * as stats from 'reader/stats';

const debug = debugFactory( 'calypso:blocks:reader-post-card' );

function FeaturedImage( { image, href } ) {
	return (
		<a className="reader-post-card__featured-image" href={ href } style={ {
			backgroundImage: 'url(' + image.uri + ')',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '50% 50%'
		} } ></a> );
}

function PostByline( { post } ) {
	return (
		<div className="reader-post-card__meta ignore-click">
			<Gravatar user={ post.author } />
			<div className="reader-post-card__meta-details">
				<a className="reader-post-card__author reader-post-card__link">Sue Smith</a>
				<a className="reader-post-card__link">catsandfurballs.wordpress.com</a>
				<div className="reader-post-card__timestamp-and-tag">
					<span className="reader-post-card__timestamp">1 hour ago</span>
					<span className="reader-post-card__tag"><Gridicon icon="tag" />Pets</span>
				</div>
			</div>
		</div>
	);
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
				stats.recordPermalinkClick( 'card_title_with_modifier' );
				stats.recordGaEvent( 'Clicked Post Permalink with Modifier' );
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
			length: isPhotoOnly ? 50 : 140,
			separator: /,? +/
		} );
		const classes = classnames( 'reader-post-card', {
			'has-thumbnail': !! featuredImage,
			'is-photo': isPhotoOnly
		} );

		const postTitle = get( post, 'title' );
		debug( 'site for post ' + postTitle );
		debug( site );
		debug( 'feed for post ' + postTitle );
		debug( feed );

		return (
			<Card className={ classes } onClick={ this.handleCardClick }>
				<PostByline post={ post } site={ site } feed={ feed } />
				<div className="reader-post-card__post">
					{ featuredImage && <FeaturedImage image={ featuredImage } href={ post.URL } /> }
					<div className="reader-post-card__post-details">
						<h1 className="reader-post-card__title">
							<a className="reader-post-card__title-link" href={ post.URL }>{ title }</a>
						</h1>
						<div className="reader-post-card__excerpt">{ post.short_excerpt }</div>
						{ post &&
							<ReaderPostActions
								post={ post }
								showVisit={ true }
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
