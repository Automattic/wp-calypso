/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { sample } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FollowButton from 'client/blocks/follow-button/button';
import QueryReaderTagImages from 'client/components/data/query-reader-tag-images';
import { getTagImages } from 'client/state/reader/tags/images/selectors';
import resizeImageUrl from 'client/lib/resize-image-url';
import cssSafeUrl from 'client/lib/css-safe-url';
import { decodeEntities } from 'client/lib/formatting';

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

	pickTagImage = ( props = this.props ) => {
		return sample( props.tagImages );
	};

	state = {
		tagImages: this.props.tagImages,
		chosenTagImage: this.pickTagImage(),
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.tagImages !== this.props.tagImages ) {
			this.setState( { chosenTagImage: this.pickTagImage( nextProps ) } );
		}
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

		let photoByWrapper;
		let authorLink;
		if ( tagImage ) {
			const imageUrl = resizeImageUrl( 'https://' + tagImage.url, {
				resize: `${ TAG_HEADER_WIDTH },${ TAG_HEADER_HEIGHT }`,
			} );
			const safeCssUrl = cssSafeUrl( imageUrl );
			imageStyle.backgroundImage = 'url(' + safeCssUrl + ')';

			photoByWrapper = <span className="tag-stream__header-image-byline-label" />;
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
				{ showFollow && (
					<div className="tag-stream__header-follow">
						<FollowButton
							followLabel={ translate( 'Follow Tag' ) }
							followingLabel={ translate( 'Following Tag' ) }
							iconSize={ 24 }
							following={ following }
							onFollowToggle={ onFollowToggle }
						/>
					</div>
				) }

				<div className="tag-stream__header-image" style={ imageStyle }>
					<h1 className="tag-stream__header-image-title">
						<Gridicon icon="tag" size={ 24 } />
						{ title }
					</h1>
					{ tagImage && (
						<div className="tag-stream__header-image-byline">
							{ translate( '{{photoByWrapper}}Photo by{{/photoByWrapper}} {{authorLink/}}', {
								components: {
									photoByWrapper,
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
