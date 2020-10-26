/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { sample } from 'lodash';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import FollowButton from 'calypso/blocks/follow-button/button';
import QueryReaderTagImages from 'calypso/components/data/query-reader-tag-images';
import { getTagImages } from 'calypso/state/reader/tags/images/selectors';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import cssSafeUrl from 'calypso/lib/css-safe-url';
import { decodeEntities } from 'calypso/lib/formatting';

const TAG_HEADER_WIDTH = 800;
const TAG_HEADER_HEIGHT = 140;

class TagStreamHeader extends React.Component {
	static propTypes = {
		isPlaceholder: PropTypes.bool,
		showFollow: PropTypes.bool,
		following: PropTypes.bool,
		onFollowToggle: PropTypes.func,
		tagImages: PropTypes.array,
		showBack: PropTypes.bool,
	};

	static defaultProps = {
		tagImages: [],
	};

	state = {
		tagImages: this.props.tagImages,
		chosenTagImage: sample( this.props.tagImages ),
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( nextProps.tagImages === prevState.tagImages ) {
			return null;
		}

		return {
			tagImages: nextProps.tagImages,
			chosenTagImage: sample( nextProps.tagImages ),
		};
	}

	render() {
		const {
			title,
			isPlaceholder,
			showFollow,
			following,
			onFollowToggle,
			translate,
			showBack,
			imageSearchString,
		} = this.props;
		const classes = classnames( {
			'tag-stream__header': true,
			'is-placeholder': isPlaceholder,
			'has-back-button': showBack,
		} );
		const imageStyle = {};
		const tagImage = this.state.chosenTagImage;

		let sourceWrapper;
		let authorLink;
		if ( tagImage ) {
			const imageUrl = resizeImageUrl( 'https://' + tagImage.url, {
				resize: `${ TAG_HEADER_WIDTH },${ TAG_HEADER_HEIGHT }`,
			} );
			const safeCssUrl = cssSafeUrl( imageUrl );
			imageStyle.backgroundImage = 'url(' + safeCssUrl + ')';

			sourceWrapper = <span className="tag-stream__header-image-byline-label" />;
			authorLink = (
				<a
					href={ `/read/blogs/${ tagImage.blog_id }/posts/${ tagImage.post_id }` }
					className="tag-stream__header-image-byline-link"
					rel="author"
				>
					{ decodeEntities( tagImage.author ) }
				</a>
			);
		}

		return (
			<div className={ classes }>
				<QueryReaderTagImages tag={ imageSearchString } />
				<div className="tag-stream__header-follow">
					{ showFollow && (
						<FollowButton
							followLabel={ translate( 'Follow Tag' ) }
							followingLabel={ translate( 'Following tag' ) }
							iconSize={ 24 }
							following={ following }
							onFollowToggle={ onFollowToggle }
						/>
					) }
				</div>
				<div className="tag-stream__header-image" style={ imageStyle }>
					<h1 className="tag-stream__header-image-title">
						<Gridicon icon="tag" size={ 24 } />
						{ title }
					</h1>
					{ tagImage && (
						<div className="tag-stream__header-image-byline">
							{ translate( '{{sourceWrapper}}Photo from{{/sourceWrapper}} {{authorLink/}}', {
								components: {
									sourceWrapper,
									authorLink,
								},
							} ) }
						</div>
					) }
				</div>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		tagImages: getTagImages( state, ownProps.imageSearchString ),
	};
} )( localize( TagStreamHeader ) );
