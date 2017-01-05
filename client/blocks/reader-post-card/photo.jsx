/**
 * External Dependencies
 */
import React from 'react';
import { noop, debounce } from 'lodash';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
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
		this.props.onExpanded();
	}

	getViewportHeight = () =>
		Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );

	setCardWidth = () => {
		if ( this.widthDivRef ) {
			const cardWidth = this.widthDivRef.getClientRects()[ 0 ].width;
			if ( cardWidth > 0 ) {
				this.setState( { cardWidth } );
			}
		}
	}

	handleWidthDivLoaded = ( ref ) => {
		this.widthDivRef = ref;
	}

	componentDidMount() {
		this.resizeListener = window.addEventListener( 'resize', debounce( this.setCardWidth, 50 ) );
		this.setCardWidth();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
	}

	render() {
		const { title, imageUri, href, children, imageSize } = this.props;

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

			featuredImageStyle.height = newHeight;
		}

		const classes = classnames( {
			'reader-post-card__photo': true,
			'is-expanded': this.state.isExpanded
		} );

		return (
			<div className="reader-post-card__post" >
				<a className={ classes } href={ href } style={ featuredImageStyle } onClick={ this.handleClick }>
					<div ref={ this.handleWidthDivLoaded } style={ { width: '100%' } }></div>
				</a>
				<AutoDirection>
					<h1 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ href }>{ title || '\xa0' }</a>
					</h1>
				</AutoDirection>
				{ children }
			</div> );
	}
}

PostPhoto.propTypes = {
	imageUri: React.PropTypes.string,
	imageHeight: React.PropTypes.number,
	href: React.PropTypes.string,
	title: React.PropTypes.string,
	onClick: React.PropTypes.func,
	onExpanded: React.PropTypes.func
};

PostPhoto.defaultProps = {
	onClick: noop,
	onExpanded: noop
};

export default PostPhoto;
