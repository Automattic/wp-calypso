/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { noop, throttle, truncate } from 'lodash';
import classnames from 'classnames';
import ReactDom from 'react-dom';
import closest from 'component-closest';
import userModule from 'lib/user';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import DisplayTypes from 'state/reader/posts/display-types';
import * as stats from 'reader/stats';
import ReaderPostActions from 'blocks/reader-post-actions';
import PostByline from './byline';
import GalleryPost from './gallery';
import PhotoPost from './photo';
import StandardPost from './standard';
import FollowButton from 'reader/follow-button';
import DailyPostButton from 'blocks/daily-post-button';
import { isDailyPostChallengeOrPrompt } from 'blocks/daily-post-button/helper';
import { getDiscoverBlogName,
	getSourceFollowUrl as getDiscoverFollowUrl,
	isDiscoverPost
} from 'reader/discover/helper';
import DiscoverFollowButton from 'reader/discover/follow-button';

function trackable( TrackedComponent ) {
	return class Trackable extends React.Component {
		constructor( props ) {
			super( props );
			this.state = {
				isOnScreen: false,
				user: false,
				readPixelKey: false,
				readPixelInterval: false
			};
		}

		defaultProps = {
			onAppear: noop,
			onHeartbeat: noop,
			onLeave: noop
		}

		componentDidMount() {
			window.addEventListener( 'scroll', this.checkOnScreen );
			window.addEventListener( 'resize', this.checkOnScreen );
			document.addEventListener( 'visibilitychange', this.checkOnScreen );
			this.checkOnScreen();
		}

		componentWillUnmount() {
			window.removeEventListener( 'scroll', this.checkOnScreen );
			window.removeEventListener( 'resize', this.checkOnScreen );
			document.removeEventListener( 'visibilitychange', this.checkOnScreen );
		}

		checkOnScreen = throttle( () => {

			if ( ! this.nodeRef ) {
				if ( this.state.readPixelInterval ) {
					window.clearInterval( this.state.readPixelInterval );
				}
				return;
			}

			const rect = this.nodeRef.getBoundingClientRect();
			const html = document.documentElement;
			const windowHeight = window.innerHeight || html.clientHeight;

			function documentNotHidden() {
				if ( typeof document.hidden === 'undefined' ) {
					return true;
				}
				return ! document.hidden;
			}

			function entirelyOnScreen() {
				return rect.top >= 0 &&
					rect.bottom <= windowHeight;
			}

			function biggerThanScreen() {
				return rect.top < 0 &&
					rect.bottom >= windowHeight;
			}

			function partiallyOnScreen() {
				return ( rect.top >= 0 && rect.top <= windowHeight * .75 ) ||
					( rect.bottom <= windowHeight && rect.bottom >= windowHeight * .25 );
			}

			function generateKey() {
				const randomBytesLength = 18; // 18 * 4/3 = 24 (base64 encoded chars)
				let i, randomBytes = [];

				if ( window.crypto && window.crypto.getRandomValues ) {
					randomBytes = new Uint8Array( randomBytesLength );
					window.crypto.getRandomValues( randomBytes );
				} else {
					for ( i = 0; i < randomBytesLength; ++i ) {
						randomBytes[ i ] = Math.floor( Math.random() * 256 );
					}
				}

				return window
					.btoa( String.fromCharCode.apply( String, randomBytes ) )
					.replace( /\+/g, '-' )
					.replace( /\//g, '_' );
			}

			if ( documentNotHidden() && ( entirelyOnScreen() || biggerThanScreen() || partiallyOnScreen() ) ) {
				if ( ! this.state.isOnScreen ) {
					const self = this;
					const key = generateKey();
					const user = userModule().get();
					self.setState( {
						isOnScreen: performance.now(),
						user: user,
						readPixelKey: key,
						readPixelInterval: window.setInterval( function() {
							if ( self.state.isOnScreen ) {
								self.props.onHeartbeat(
									self.state.user,
									self.state.readPixelKey,
									performance.now() - self.state.isOnScreen
								);
							}
							self.checkOnScreen();
						}, 1E4 )
					} );
					this.props.onAppear( user, key );
				}
			} else if ( this.state.isOnScreen ) {
				const timeOnScreen = performance.now() - this.state.isOnScreen;
				const key = this.state.readPixelKey;
				const user = this.state.user;
				window.clearInterval( this.state.readPixelInterval );
				this.setState( {
					isOnScreen: false,
					user: false,
					readPixelKey: false,
					readPixelInterval: false
				} );
				this.props.onLeave( user, key, timeOnScreen );
			}
		}, 150 )

		bindRef = ( ref ) => {
			this.nodeRef = ReactDom.findDOMNode( ref );
		}
		render() {
			let { className, onAppear, onHeartbeat, onLeave, ...props } = this.props;
			className = classnames( className, {
				'is-on-screen': !! this.state.isOnScreen
			} );
			return <TrackedComponent ref={ this.bindRef } className={ className } { ...props } />;
		}
	};
}

const TrackableCard = trackable( Card );

export default class ReaderPostCard extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		isSelected: PropTypes.bool,
		onClick: PropTypes.func,
		onCommentClick: PropTypes.func,
		showPrimaryFollowButton: PropTypes.bool,
		originalPost: PropTypes.object, // used for Discover only
		showSiteName: PropTypes.bool,
		followSource: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
		onCommentClick: noop,
		isSelected: false,
	};

	propagateCardClick = () => {
		// If we have an original post available (e.g. for a Discover pick), send the original post
		// to the full post view
		const postToOpen = this.props.originalPost ? this.props.originalPost : this.props.post;
		this.props.onClick( postToOpen );
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

	triggerStreamPixelRequest = ( type, user, key, timeOnScreen ) => {
		let urlParams = new Array();

		// Stream type
		urlParams.push( 'stream' );
		switch ( type ) {
			case 'appear':
			case 'heartbeat':
			case 'leave':
				urlParams.push( 'type=' + encodeURIComponent( type ) );
				break;
			default:
				return;
		}

		// Session ID / item key
		urlParams.push( 'id=' + encodeURIComponent( key ) );

		// Card info
		urlParams.push( 'feed=' + this.props.post.feed_ID );
		urlParams.push( 'feeditem=' + this.props.post.feed_item_ID );

		// Total time
		urlParams.push( 'ms=' + timeOnScreen.toFixed( 0 ) );

		// User ID and Type
		urlParams.push( 'userid=' + user.ID );
		urlParams.push( 'useridtype=wpcom' );

		( new Image() ).src = 'https://pixel.wp.com/g.gif?' + urlParams.join( '&' );
	}

	onAppear = ( user, key ) => {
		this.triggerStreamPixelRequest( 'appear', user, key, 0 );
	}

	onHeartbeat = ( user, key, timeOnScreen ) => {
		this.triggerStreamPixelRequest( 'heartbeat', user, key, timeOnScreen );
	}

	onLeave = ( user, key, timeOnScreen ) => {
		this.triggerStreamPixelRequest( 'leave', user, key, timeOnScreen );
	}

	render() {
		const {
			post,
			originalPost,
			site,
			feed,
			onCommentClick,
			showPrimaryFollowButton,
			isSelected,
			showSiteName,
			followSource,
		} = this.props;

		const isPhotoPost = !! ( post.display_type & DisplayTypes.PHOTO_ONLY );
		const isGalleryPost = !! ( post.display_type & DisplayTypes.GALLERY );
		const isDiscover = isDiscoverPost( post );
		const title = truncate( post.title, { length: 140, separator: /,? +/ } );
		const classes = classnames( 'reader-post-card', {
			'has-thumbnail': !! post.canonical_media,
			'is-photo': isPhotoPost,
			'is-gallery': isGalleryPost,
			'is-selected': isSelected,
			'is-discover': isDiscover
		} );

		let discoverFollowButton;

		if ( isDiscover ) {
			const discoverBlogName = getDiscoverBlogName( post ) || null;
			discoverFollowButton = discoverBlogName &&
				<DiscoverFollowButton siteName={ discoverBlogName } followUrl={ getDiscoverFollowUrl( post ) } />;
		}

		const readerPostActions = <ReaderPostActions
			post={ originalPost ? originalPost : post }
			visitUrl = { post.URL }
			showVisit={ true }
			showMenu={ true }
			showMenuFollow={ ! isDiscover }
			onCommentClick={ onCommentClick }
			showEdit={ false }
			className="ignore-click"
			iconSize={ 18 } />;

		let readerPostCard;
		if ( isPhotoPost ) {
			readerPostCard = <PhotoPost post={ post } title={ title } onClick={ this.handleCardClick } >
					{ discoverFollowButton }
					{ readerPostActions }
				</PhotoPost>;
		} else if ( isGalleryPost ) {
			readerPostCard = <GalleryPost post={ post } title={ title } isDiscover={ isDiscover }>
					{ readerPostActions }
				</GalleryPost>;
		} else {
			readerPostCard = <StandardPost post={ post } title={ title } isDiscover={ isDiscover }>
					{ isDailyPostChallengeOrPrompt( post ) && <DailyPostButton post={ post } tagName="span" /> }
					{ discoverFollowButton }
					{ readerPostActions }
				</StandardPost>;
		}

		const followUrl = feed ? feed.feed_URL : post.site_URL;

		return (
			<TrackableCard onAppear={ this.onAppear } onHeartbeat={ this.onHeartbeat } onLeave={ this.onLeave } className={ classes } onClick={ ! isPhotoPost && this.handleCardClick }>
				<PostByline post={ post } site={ site } feed={ feed } showSiteName={ showSiteName } />
				{ showPrimaryFollowButton && followUrl && <FollowButton siteUrl={ followUrl } followSource={ followSource } /> }
				{ readerPostCard }
				{ this.props.children }
			</TrackableCard>
		);
	}
}
