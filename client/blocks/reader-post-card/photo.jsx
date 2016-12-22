/**
 * External Dependencies
 */
import React from 'react';
import { noop, debounce } from 'lodash';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import cssSafeUrl from 'lib/css-safe-url';

class PostPhoto extends React.Component {

	state = {
		isExpanded: false,
		cardWidth: 800,
	};

	handleClick = ( event ) => {
		if ( this.state.isExpanded ) {
			return;
		}

		// If the photo's not expanded, don't open full post yet
		event.preventDefault();
		this.setState( { isExpanded: true } );
	}

	// might need to debounce this
	getViewportHeight = () =>
		Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );

	setCardWidth = () => {
		const cardWidth = this.widthDivRef.getClientRects()[ 0 ].width;
		if ( cardWidth > 0 ) {
			this.setState( { cardWidth } );
		}
	}

	handleWidthDivLoaded = ( ref ) => {
		this.widthDivRef = ref;
	}

	componentDidMount() {
		this.resizeListener = window.addEventListener( 'resize', debounce( this.setCardWidth, 50 ) );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
	}

	render() {
		const { imageUri, href, children, imageSize } = this.props;

		if ( imageUri === undefined ) {
			return null;
		}

		const featuredImageStyle = {
			backgroundImage: 'url(' + cssSafeUrl( imageUri ) + ')',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center'
		};

		if ( this.state.isExpanded ) {
			const viewportHeight = this.getViewportHeight();
			const cardWidth = this.state.cardWidth;
			const { width: naturalWidth, height: naturalHeight } = imageSize;

			const newHeight = Math.min(
				( naturalHeight / naturalWidth ) * cardWidth,
				viewportHeight - 176
			);
//			console.error( naturalHeight, naturalWidth, viewportHeight, ( naturalHeight / naturalWidth ) * cardWidth );
			featuredImageStyle.height = newHeight;
		}

		const classes = classnames( {
			'reader-post-card__photo': true,
			'is-expanded': this.state.isExpanded
		} );

		return (
			<a className={ classes } href={ href } style={ featuredImageStyle } onClick={ this.handleClick }>
				<div ref={ this.handleWidthDivLoaded } style={ { width: '100%' } }></div>
				{ children }
			</a>
		);
	}
}

PostPhoto.propTypes = {
	imageUri: React.PropTypes.string,
	imageHeight: React.PropTypes.number,
	href: React.PropTypes.string,
};

PostPhoto.defaultProps = {
	onClick: noop,
};

export default PostPhoto;
