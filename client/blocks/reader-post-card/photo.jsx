/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop, debounce } from 'lodash';

/**
 * Internal Dependencies
 */
import PostPhotoImage from './photo-image';

class PostPhoto extends React.Component {
	state = {
		cardWidth: 800,
	};

	// handleClick = event => {
	// 	if ( this.props.isExpanded ) {
	// 		this.props.onClick( event );
	// 		return;
	// 	}

	// 	event.preventDefault();
	// 	const { post, site, postKey } = this.props;
	// 	this.props.expandCard( { post, site, postKey } );
	// };

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
	};

	handleWidthDivLoaded = ref => {
		this.widthDivRef = ref;
	};

	componentDidMount() {
		this.resizeListener = window.addEventListener( 'resize', debounce( this.setCardWidth, 50 ) );
		this.setCardWidth();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
	}

	render() {
		const { post, title, isExpanded, onClick, children } = this.props;

		return (
			<div className="reader-post-card__post">
				{ !! post.canonical_media.src && (
					<PostPhotoImage
						post={ post }
						title={ title }
						isExpanded={ isExpanded }
						onClick={ onClick }
					/>
				) }
				<div className="reader-post-card__post-details">{ children }</div>
			</div>
		);
	}
}

PostPhoto.propTypes = {
	post: PropTypes.object,
	site: PropTypes.object,
	title: PropTypes.string,
	onClick: PropTypes.func,
};

PostPhoto.defaultProps = {
	onClick: noop,
};

export default PostPhoto;
