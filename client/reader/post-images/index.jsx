/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	resizeImageUrl = require( 'lib/resize-image-url' ),
	domScrollIntoView = require( 'dom-scroll-into-view' ),
	ReactCSSTransitionGroup = require( 'react-addons-css-transition-group' );

/**
 * Internal dependencies
 */
var stats = require( 'reader/stats' ),
	viewport = require( 'lib/viewport' );

var PostImages = React.createClass( {

	getInitialState: function() {
		return {
			viewing: false,
			visibleIndex: 0
		};
	},

	_isInput: function( element ) {
		return [ 'INPUT', 'TEXTAREA' ].indexOf( element.nodeName ) > -1;
	},

	handleKeyDown: function( event ) {
		var keyCodes = [ 27, 37, 39 ],
			nextIndex;
		if ( ! this._isInput( event.target ) &&
			keyCodes.indexOf( event.keyCode ) > -1 && viewport.isDesktop() ) {
			switch ( event.keyCode ) {
				case 27: //esc
					this.toggleGallery( event );
					break;
				case 37: //left arrow
					nextIndex = ( this.state.visibleIndex - 1 +
						this.props.postImages.length ) %
						this.props.postImages.length;
					this.scrollToImage( nextIndex );
					break;
				case 39: //right arrow
					nextIndex = ( this.state.visibleIndex + 1 ) %
						this.props.postImages.length;
					this.scrollToImage( nextIndex );
					break;
			}
		}
	},

	componentDidUpdate: function( prevProps, prevState ) {
		if ( this.state.viewing !== prevState.viewing ) {
			if ( this.state.viewing ) {
				// only add desktop handlers if gallery view takes up fullscreen
				if ( viewport.isDesktop() ) {
					window.addEventListener( 'keydown', this.handleKeyDown );
				}
			} else {
				window.removeEventListener( 'keydown', this.handleKeyDown );
			}
		}
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'keydown', this.handleKeyDown );
	},

	scrollToImage: function( nextIndex ) {
		this.setState( {
			visibleIndex: nextIndex
		} );
		let container = ReactDom.findDOMNode( this._fullListContainer );
		let images = ReactDom.findDOMNode( this._fullList ).children;
		domScrollIntoView( images[ nextIndex ], container, { alignWithLeft: true } );
	},

	toggleGallery: function( event ) {
		if ( event.defaultPrevented ) {
			return;
		}
		event.preventDefault();
		let newState = ! this.state.viewing;

		stats.recordAction( newState ? 'open_gallery' : 'close_gallery' );
		stats.recordGaEvent( newState ? 'Clicked Open Gallery' : 'Clicked Close Gallery' );
		stats.recordTrack( 'calypso_reader_post_gallery_' + ( newState ? 'opened' : 'closed' ), {
			image_count: this.props.postImages && this.props.postImages.length
		} );

		this.setState( {
			viewing: newState
		} );

		document.documentElement.classList.toggle( 'reader-gallery-open' );
	},

	ignoreClick: function( event ) {
		event.preventDefault();
	},

	render: function() {
		var images = this.props.postImages,
			count = images.length,
			containerClasses = [ 'reader-post-images', 'ignore-click' ],
			fullList;

		if ( count < 2 ) {
			return null;
		}

		/* Generate a list of large images */
		if ( this.state.viewing ) {
			fullList = images.map( function( image, index ) {
				return (
					<li key={ 'full-image-' + index } className="reader-post-images__full-image">
						<img
							src={ resizeImageUrl( image.src, { h: 800, w: 800 } ) }
							onClick={ this.ignoreClick }
						/>
					</li>
				);
			}, this );
		}

		/* Add the viewing class if needed */
		if ( this.state.viewing ) {
			containerClasses.push( 'is-viewing' );
		}

		containerClasses = containerClasses.join( ' ' );

		return (
			<div className={ containerClasses } onClick={ this.toggleGallery }>
				<PostImageThumbList postImages={ images } />

				<span className="reader-post-images__label">{ this.translate( 'View Gallery' ) }</span>
				<span className="reader-post-images__count">{ this.translate( '%(count)d image', '%(count)d images', {
					count: count,
					args: { count: count }
				} ) }
				</span>

				<div
					className="reader-post-images__full-list"
					ref={ ( c ) => this._fullListContainer = c } >
					<span className="reader-post-images__close">{ this.translate( 'Close' ) }</span>
					<ReactCSSTransitionGroup
						ref={ ( c ) => this._fullList = c }
						component="ol"
						transitionEnterTimeout={ 200 }
						transitionLeaveTimeout={ 200 }
						transitionName="gallery-image"
						transitionEnter={ true }
						transitionLeave={ true }>
						{ fullList }
					</ReactCSSTransitionGroup>
				</div>
			</div>
		);
	}

} );

var PostImageThumbList = React.createClass( {

	mixins: [ PureRenderMixin ],

	render: function() {
		var images = this.props.postImages,
			thumbList = images.map( function( image, index ) {
				return (
					<li key={ 'thumb-image-' + index } className="reader-post-images__image">
						<img src={ resizeImageUrl( image.src, { resize: '40,40' } ) } />
					</li>
				);
			} );

		return (
			<ol className="reader-post-images__list">
				{ thumbList }
			</ol>
		);
	}

} );

module.exports = PostImages;
