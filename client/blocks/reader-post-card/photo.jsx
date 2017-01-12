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
			this.props.onClick( event );
			return;
		}

		event.preventDefault();
		this.setState( { isExpanded: true } );
		this.props.onExpanded();
	}

	getViewportHeight = () =>
		Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );

	/* We want photos to be able to expand to be essentially full-screen
	 * We settled on viewport height - 176px because the
	 *  - masterbar is 47px tall
	 *  - card header is 74px tall
	 *  - card footer is 55px tall
	 * 47 + 74 + 55 = 176
	 */
	getMaxPhotoHeight = () => this.getViewportHeight() - 176;

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
		const { imageUri, href, children, imageSize } = this.props;

		if ( imageUri === undefined ) {
			return null;
		}

		const featuredImageStyle = {
			backgroundImage: 'url(' + cssSafeUrl( imageUri ) + ')',
			backgroundSize: this.state.isExpanded ? 'contain' : 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center'
		};
		let newWidth, newHeight;
		if ( this.state.isExpanded ) {
			const cardWidth = this.state.cardWidth;
			const { width: naturalWidth, height: naturalHeight } = imageSize;

			newHeight = Math.min(
				( naturalHeight / naturalWidth ) * cardWidth,
				this.getMaxPhotoHeight(),
			);
			newWidth = ( naturalWidth / naturalHeight ) * newHeight;
			featuredImageStyle.height = newHeight;
			featuredImageStyle.width = newWidth;
		}

		const classes = classnames( {
			'reader-post-card__photo': true,
			'is-expanded': this.state.isExpanded
		} );

		const divStyle = this.state.isExpanded
			? { height: newHeight, width: newWidth, margin: 'auto', paddingBottom: '20px' }
			: {};

		return (
			<div style={ divStyle } >
				<a className={ classes } href={ href } style={ featuredImageStyle } onClick={ this.handleClick }>
					<div ref={ this.handleWidthDivLoaded } style={ { width: '100%' } }></div>
					{ children }
				</a>
				<h1 className="reader-post-card__title">
					<a className="reader-post-card__title-link" href={ this.props.href }>{ this.props.title }</a>
				</h1>
			</div>
		);
	}
}

PostPhoto.propTypes = {
	imageUri: React.PropTypes.string,
	imageHeight: React.PropTypes.number,
	href: React.PropTypes.string,
	onClick: React.PropTypes.func,
	onExpanded: React.PropTypes.func,
};

PostPhoto.defaultProps = {
	onClick: noop,
	onExpanded: noop,
};

export default PostPhoto;
