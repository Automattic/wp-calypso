/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop, debounce } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import PostPhotoImage from './photo-image';

class PostPhoto extends React.Component {
	state = {
		cardWidth: 800,
	};

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

	toggleCard = () => {
		const { post, site, postKey, expandCard, isExpanded } = this.props;
		if ( ! isExpanded ) {
			expandCard( { post, site, postKey } );
		}
	};

	render() {
		const { post, title, isExpanded, onClick, children, translate } = this.props;
		const zoomIcon = isExpanded ? 'zoom-out' : 'zoom-in';

		return (
			<div className="reader-post-card__post">
				<div className="reader-post-card__photo-expand-controls">
					<Gridicon
						icon={ zoomIcon }
						onClick={ this.toggleCard }
						title={ isExpanded ? translate( 'Expand photo' ) : translate( 'Shrink photo' ) }
					/>
				</div>
				{ !! post.canonical_media.src && (
					<PostPhotoImage
						post={ post }
						title={ title }
						isExpanded={ isExpanded }
						onClick={ onClick }
						cardWidth={ this.state.cardWidth }
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
	expandCard: PropTypes.func,
	shrinkCard: PropTypes.func,
};

PostPhoto.defaultProps = {
	onClick: noop,
};

export default localize( PostPhoto );
